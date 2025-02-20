import express from 'express';
import { getDatabase } from './lib/db.client.js';
import { environment } from './lib/environment.js';
import { logger } from './lib/logger.js';
import { validateInputs } from './validation/validate.js';
import process from 'node:process';
import xss from 'xss';

export const router = express.Router();

router.get('/', async (req, res) => {
  const result = await getDatabase()?.query('SELECT * FROM categories');

  const categories = result?.rows ?? [];

  console.log(categories);
  res.render('index', { title: 'Forsíða', categories });
});

router.get('/spurningar/:category', async (req, res) => {
	const db = getDatabase();
  const categoryId = req.params.category;
	const categoryResult = await db?.query('SELECT * FROM categories WHERE id = $1', [
		categoryId
	]);
	const categoryName = categoryResult.rows[0]?.name;
	const questionsResult = await db?.query(
		'SELECT * FROM questions WHERE category_id = $1', [
		categoryId,
	]);

	const questionsWithAnswers = await Promise.all(
		questionsResult.rows.map(async (question) => {
			const answersResult = await db?.query(
				'SELECT * FROM answers WHERE question_id = $1', [
				question.id
			]);
			question.answers = answersResult.rows
			return question;
		})
	);

	console.log(questionsWithAnswers);

  res.render('category', { 
		title: `Questions about ${categoryName}`,
		id: categoryId,
		questions: questionsWithAnswers,
		result: null
	});
});

router.post('/spurningar/:category', async (req, res) => {
	const { category } = req.params;
	const answers_from_user = req.body;
	const db = getDatabase();
	const categoryResult = await db?.query('SELECT * FROM categories WHERE id = $1', [
		category
	]);
	const categoryName = categoryResult.rows[0]?.name;
	const questionsResult = await db?.query(
		'SELECT * FROM questions WHERE category_id = $1', [
		category,
	]);

	const questionsWithAnswers = await Promise.all(
		questionsResult.rows.map(async (question) => {
			const answersResult = await db?.query(
				'SELECT * FROM answers WHERE question_id = $1', [
				question.id
			]);
			question.answers = answersResult.rows
			return question;
		})
	);

	const realAnswersResult = await db?.query(`
		SELECT question_id as q_id, answers.id as a_id FROM answers, questions
		WHERE is_correct = true
		AND category_id = $1
		AND question_id = questions.id`, [
			category
	]);

	const realAnswers = realAnswersResult.rows.map(question => {
		return {
			q_id: question.q_id,
			a_id: (question.a_id-1) % 4
		}
	});

	const result = [];

	realAnswers.forEach((answer, aId) => {
		const user_answer = Number(answers_from_user[aId])
		if (user_answer === answer.a_id) {
			result.push({
				correct: user_answer,
				incorrect: -1
			});
		} else {
			result.push({
				correct: answer.a_id,
				incorrect: user_answer
			});
		}
	});

  res.render('category', { 
		title: `Questions about ${categoryName}`,
		id: category,
		questions: questionsWithAnswers,
		result: result
	});
});

router.get('/form', async (req, res) => {
	const result = await getDatabase()?.query('SELECT * FROM categories');
	const categories = result?.rows ?? [];

	console.log(categories);

  res.render('form', { 
		title: 'Búa til spurningu',
		categories: categories,
		error: null
	});
});

router.post('/form', async (req, res) => {
	let { category, question, answers, right_answer } = req.body;
	question = xss(question);
	answers = xss(answers).split(';');

	console.log(question);
	console.log(answers);

	const error = validateInputs(question, answers);

	if (error) {
		const result = await getDatabase()?.query('SELECT * FROM categories');
		const categories = result?.rows ?? [];

		res.render('form', { 
			title: 'Búa til spurningu',
			categories: categories,
			error: error
		});
		return;
	}

  const env = environment(process.env, logger);
  if (!env) {
    process.exit(1);
  }

  const db = getDatabase();

  const result = await db?.query('INSERT INTO questions (question, category_id) VALUES ($1, $2) RETURNING id', [
    question,
		category
  ]);

	const questionId = result.rows[0].id;

	answers.forEach(async (answer, aIndex) => {
		const aResult = await db?.query('INSERT INTO answers (answer, is_correct, question_id) VALUES ($1, $2, $3)', [
			xss(answer),
			aIndex+1 == right_answer ? 'true' : 'false',
			questionId
		]);

		console.log(aResult);
	});

  console.log(result);

  res.render('form-created', { title: 'Spurning búin til' });
});
