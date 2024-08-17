import app from './src/app';
import { calculateDiscount } from './src/utils';
import request from 'supertest';

//Unit Testing
describe('App', () => {
    it('should calculate the discount', () => {
        const result = calculateDiscount(100, 20);
        expect(result).toBe(20);
    });
    it('should return 200 status', async () => {
        const response = await request(app).get('/').send();
        expect(response.statusCode).toBe(200);
    });
});
