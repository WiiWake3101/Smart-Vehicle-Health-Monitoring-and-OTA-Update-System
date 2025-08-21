import { test, expect } from '@jest/globals';
import { supabase } from '../../lib/supabase';

test('hello world!', () => {
	expect(1 + 1).toBe(2);
});

test('supabase client is initialized', () => {
	expect(supabase).toBeDefined();
});

test('supabase connection test', async () => {
	const { data, error } = await supabase
		.from('sensor_data') // replace with a real table name
		.select('*')
		.limit(1);

	expect(error).toBeNull();
	expect(Array.isArray(data)).toBe(true);
});