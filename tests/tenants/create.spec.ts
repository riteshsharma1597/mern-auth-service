import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import request from 'supertest';
import app from '../../src/app';
import { Tenant } from '../../src/entity/Tenant';
import createJWKSMOck from 'mock-jwks';
import { Roles } from '../../src/constants';

describe('POST /tenants', () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMOck>;
    let adminToken: string;
    beforeAll(async () => {
        jwks = createJWKSMOck('http://localhost:5501');
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        jwks.start();
        //Database truncate
        await connection.dropDatabase();
        await connection.synchronize();
        // await truncateTables(connection);
        adminToken = jwks.token({
            sub: '1',
            role: Roles.ADMIN,
        });
    });

    afterAll(async () => {
        jwks.stop();
        await connection?.destroy();
    });
    describe('Given all fields', () => {
        it('should return 201 status code ', async () => {
            //Arrange
            const tenantData = {
                name: 'Jagdeesh Restaurants',
                address: 'Babhnan, Market , Basti',
            };

            //Act
            const response = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(tenantData);

            //Assert
            expect(response.statusCode).toBe(201);
        });
        it('should create a tenant in the database', async () => {
            //Arrange
            const tenantData = {
                name: 'Jagdeesh Restaurants',
                address: 'Babhnan, Market , Basti',
            };

            //Act

            await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(tenantData);

            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();

            expect(tenants).toHaveLength(1);
            expect(tenants[0].name).toBe(tenantData.name);
            expect(tenants[0].address).toBe(tenantData.address);
        });
        it('should return 401 if user is not authenticated', async () => {
            //Arrange
            const tenantData = {
                name: 'Jagdeesh Restaurants',
                address: 'Babhnan, Market , Basti',
            };

            //Act
            const response = await request(app)
                .post('/tenants')
                .send(tenantData);

            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();

            expect(tenants).toHaveLength(0);
            expect(response.statusCode).toBe(401);
        });
    });
    it('should return 403 if user is not an admin', async () => {
        //Arrange
        const tenantData = {
            name: 'Jagdeesh Restaurants',
            address: 'Babhnan, Market , Basti',
        };
        const managerToken = jwks.token({
            sub: '1',
            role: Roles.MANAGER,
        });

        //Act
        const response = await request(app)
            .post('/tenants')
            .set('Cookie', [`accessToken=${managerToken}`])
            .send(tenantData);

        const tenantRepository = connection.getRepository(Tenant);
        const tenants = await tenantRepository.find();

        expect(response.statusCode).toBe(403);

        expect(tenants).toHaveLength(0);
    });
    describe('Fields are missing', () => {});
});
