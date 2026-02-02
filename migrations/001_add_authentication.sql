-- Atualizar tabela students para incluir autenticação
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS password_hash text,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS approved_at timestamptz,
ADD COLUMN IF NOT EXISTS approved_by uuid;

-- Criar índice para busca por status
CREATE INDEX IF NOT EXISTS idx_students_status ON public.students(status);

-- Atualizar policy para permitir cadastro público
DROP POLICY IF EXISTS "Enable all access for students" ON public.students;

CREATE POLICY "Enable public signup" ON public.students
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read for approved students" ON public.students
  FOR SELECT USING (status = 'approved' OR id = auth.uid());

CREATE POLICY "Enable update for approved students" ON public.students
  FOR UPDATE USING (id = auth.uid() AND status = 'approved');

-- Admin pode ver/modificar tudo (adicionar depois com auth real)
CREATE POLICY "Enable all for admins" ON public.students
  FOR ALL USING (true);

COMMENT ON COLUMN public.students.status IS 'pending = aguardando aprovação, approved = aprovado, rejected = rejeitado';
COMMENT ON COLUMN public.students.password_hash IS 'Hash bcrypt da senha do usuário';
