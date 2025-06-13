import * as assert from 'assert';
import { demonstrateErrorHandling } from '../../utils/errorHandling';

suite('Error Handling Utilities', () => {
	test('demonstrateErrorHandling should throw when Positron API is not available', async () => {
		// In VS Code environment (not Positron), the API should not be available
		await assert.rejects(
			demonstrateErrorHandling(),
			{
				name: 'Error',
				message: 'Positron API not available'
			}
		);
	});
});