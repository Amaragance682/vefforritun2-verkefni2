CREATE TABLE IF NOT EXISTS public.categories (
  id serial primary key,
  name varchar(64) not null unique,
  created timestamp with time zone not null default current_timestamp
);
CREATE TABLE IF NOT EXISTS public.questions (
	id serial primary key,
	question text not null,
	category_id int references categories(id) on delete cascade,
	created timestamp with time zone not null default current_timestamp
);
CREATE TABLE IF NOT EXISTS public.answers (
	id serial primary key,
	answer text not null,
	is_correct boolean default false,
	question_id int references questions(id) on delete cascade,
	created timestamp with time zone not null default current_timestamp
);
