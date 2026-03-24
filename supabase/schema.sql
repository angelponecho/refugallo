-- ============================================================
-- REFUGALLO — Schema completo para Supabase
-- Ejecutar en: supabase.com/dashboard/project/TU_REF/sql
-- Ejecutar en este orden exacto
-- ============================================================

-- 1. TABLA THEMES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.themes (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  subtitle    TEXT,
  description TEXT,
  text        TEXT,
  "mainImg"   TEXT,
  "heroImg"   TEXT,
  "thumbImg"  TEXT,
  likes       INTEGER NOT NULL DEFAULT 0,
  visible     BOOLEAN NOT NULL DEFAULT true,
  "order"     INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "themes_public_read" ON public.themes
  FOR SELECT USING (visible = true);


-- 2. TABLA PROFILES (extiende auth.users)
-- ============================================================
CREATE TYPE public.user_role AS ENUM ('user', 'admin');

CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT,
  photo      TEXT,
  role       public.user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Cada usuario puede leer su propio perfil
CREATE POLICY "profiles_own_read" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Admin puede leer todos los perfiles
CREATE POLICY "profiles_admin_read" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Cada usuario puede actualizar su propio perfil
CREATE POLICY "profiles_own_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admin puede actualizar cualquier perfil (ej: cambiar roles)
CREATE POLICY "profiles_admin_update" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Admin puede insertar perfiles manualmente
CREATE POLICY "profiles_admin_insert" ON public.profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Admin puede eliminar perfiles
CREATE POLICY "profiles_admin_delete" ON public.profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Trigger: crear profile automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, photo)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 3. FUNCIÓN HELPER ANTI-RECURSIÓN + POLÍTICA DE ESCRITURA PARA THEMES
-- ============================================================
-- is_admin() usa SECURITY DEFINER para leer profiles sin triggear RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE POLICY "themes_admin_write" ON public.themes
  FOR ALL USING (public.is_admin());


-- 4. TABLA VOTES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.votes (
  id         SERIAL PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme_id   INTEGER NOT NULL REFERENCES public.themes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT votes_unique_user UNIQUE (user_id)
);

ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Cada usuario ve sus propios votos
CREATE POLICY "votes_own_read" ON public.votes
  FOR SELECT USING (auth.uid() = user_id);

-- Admin ve todos los votos
CREATE POLICY "votes_admin_read" ON public.votes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Solo el propio usuario puede insertar su voto
CREATE POLICY "votes_own_insert" ON public.votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);


-- 5. FUNCIÓN RPC ATÓMICA PARA VOTAR (UPSERT — un voto activo por usuario)
-- ============================================================
CREATE OR REPLACE FUNCTION public.vote_theme(p_theme_id INTEGER)
RETURNS VOID AS $$
DECLARE
  v_old_theme_id INTEGER;
BEGIN
  -- Obtener el voto actual del usuario (si existe)
  SELECT theme_id INTO v_old_theme_id
  FROM public.votes
  WHERE user_id = auth.uid();

  -- Si ya votó por el mismo theme, no hacer nada
  IF v_old_theme_id = p_theme_id THEN
    RETURN;
  END IF;

  IF v_old_theme_id IS NOT NULL THEN
    -- Cambio de voto: restar likes al theme anterior
    UPDATE public.themes
    SET likes = GREATEST(likes - 1, 0)
    WHERE id = v_old_theme_id;

    -- Actualizar el registro de voto al nuevo theme
    UPDATE public.votes
    SET theme_id = p_theme_id, created_at = NOW()
    WHERE user_id = auth.uid();
  ELSE
    -- Primer voto: insertar
    INSERT INTO public.votes (user_id, theme_id)
    VALUES (auth.uid(), p_theme_id);
  END IF;

  -- Incrementar likes del nuevo theme
  UPDATE public.themes
  SET likes = likes + 1
  WHERE id = p_theme_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permitir que cualquier usuario autenticado ejecute la función
GRANT EXECUTE ON FUNCTION public.vote_theme TO authenticated;
