import { validateInputs } from "./validate.js";
import { describe, expect, it } from "@jest/globals";

describe('validate', () => {
	describe('validateInputs', () => {
		it('returns an error message if question is too short or too long', () => {
			const result = validateInputs("a", ["A", "B", "C", "D"]);
			expect(result).toBe("Spurning þarf að vera á milli 5 og 300 characters");
		});
		it('returns an error message if there are not 4 answers', () => {
			const result = validateInputs("klattmoguesklad", ["A"]);
			expect(result).toBe("Þú þarft að hafa 4 svör");
		});
		it('returns null if inputs are valid', () => {
			const result = validateInputs("klattmoguesklad", ["A", "B", "C", "D"]);
			expect(result).toBe(null);
		});
	});
});
