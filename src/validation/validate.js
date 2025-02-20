export function validateInputs(question, answers) {
	const qLength = question.length;
	const aLength = answers.length;

	const qError = qLength < 5 || qLength > 300 
		? "Spurning þarf að vera á milli 5 og 300 characters" 
		: null;
	const aError = aLength != 4
		? "Þú þarft að hafa 4 svör"
		: null;

	return qError ? qError : aError;
}
