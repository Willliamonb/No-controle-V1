-- No Controle · Schema inicial do Supabase
-- Rode este script no SQL Editor do seu projeto Supabase.

create extension if not exists "uuid-ossp";

-- 1. profiles ---------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null, 
  created_at timestamptz not null default now()
);

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

create policy "profiles: usuário vê o próprio perfil"
  on profiles for select using (auth.uid() = id);

create policy "profiles: usuário edita o próprio perfil"
  on profiles for update using (auth.uid() = id);

create policy "profiles: usuário cria o próprio perfil"
  on profiles for insert with check (auth.uid() = id);

-- 2. incomes ------------------------------------------------------------------
create table if not exists incomes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  description text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  received_day int not null check (received_day between 1 and 31),
  created_at timestamptz not null default now()
);

alter table incomes enable row level security;

create policy "incomes: CRUD apenas do próprio usuário"
  on incomes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 3. expenses -------------------------------------------------------------
create table if not exists expenses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  description text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  category text not null check (
    category in ('moradia', 'alimentacao', 'transporte', 'saude', 'educacao', 'outros')
  ),
  due_day int not null check (due_day between 1 and 31),
  created_at timestamptz not null default now()
);

alter table expenses enable row level security;

create policy "expenses: CRUD apenas do próprio usuário"
  on expenses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4. debts -------------------------------------------------------------------
create table if not exists debts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  creditor text not null,
  description text,
  total_amount numeric(12, 2) not null check (total_amount >= 0),
  remaining_amount numeric(12, 2) not null check (remaining_amount >= 0),
  interest_rate numeric(5, 2),
  installments_total int,
  installments_paid int not null default 0,
  due_day int not null check (due_day between 1 and 31),
  status text not null default 'em_dia' check (
    status in ('em_dia', 'atrasada', 'quitada', 'negociando')
  ),
  created_at timestamptz not null default now()
);

alter table debts enable row level security;

create policy "debts: CRUD apenas do próprio usuário"
  on debts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 5. debt_payments -------------------------------------------------------
create table if not exists debt_payments (
  id uuid primary key default uuid_generate_v4(),
  debt_id uuid not null references debts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  paid_at timestamptz not null default now()
);

alter table debt_payments enable row level security;

create policy "debt_payments: CRUD apenas do próprio usuário"
  on debt_payments for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 6. financial_plans ------------------------------------------------------
create table if not exists financial_plans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  generated_at timestamptz not null default now(),
  monthly_available numeric(12, 2) not null,
  priority_order jsonb not null default '[]',
  estimated_payoff_months int not null default 0,
  tips jsonb not null default '[]',
  raw_summary text
);

alter table financial_plans enable row level security;

create policy "financial_plans: CRUD apenas do próprio usuário"
  on financial_plans for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 7. ai_messages -----------------------------------------------------------
create table if not exists ai_messages (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

alter table ai_messages enable row level security;

create policy "ai_messages: CRUD apenas do próprio usuário"
  on ai_messages for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Função para criar perfil de forma segura (ignora RLS)
CREATE OR REPLACE FUNCTION create_profile_for_user(
  user_id UUID,
  user_email TEXT,
  user_full_name TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Isso faz a função rodar com privilégios de criador
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Verificar se o perfil já existe
  IF EXISTS (SELECT 1 FROM profiles WHERE id = user_id) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Perfil já existe');
  END IF;

  -- Inserir perfil (ignora RLS por causa do SECURITY DEFINER)
  INSERT INTO profiles (id, full_name, email)
  VALUES (user_id, user_full_name, user_email);
  
  -- Retornar sucesso
  RETURN jsonb_build_object('success', true);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;