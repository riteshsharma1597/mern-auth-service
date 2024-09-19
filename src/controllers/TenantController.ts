import { NextFunction, Request, Response } from 'express';
import { TenantService } from '../services/TenantService';
import { Logger } from 'winston';
import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';

export class TenantController {
    constructor(
        private tenantService: TenantService,
        private logger: Logger,
    ) {}
    async create(req: Request, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));

            // return res.status(400).json({ errors: result.array() });
        }

        const { name, address } = req.body;

        try {
            const tenant = await this.tenantService.create({ name, address });
            res.status(201).json({ id: tenant.id });

            this.logger.info('Tenant has been created', { id: tenant.id });
        } catch (error) {
            next(error);
            return;
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));

            // return res.status(400).json({ errors: result.array() });
        }

        const { name, address } = req.body;
        const tenantId = req.params.id;

        if (isNaN(Number(tenantId))) {
            next(createHttpError(400, 'Invalid url param.'));
            return;
        }

        try {
            await this.tenantService.update(Number(tenantId), {
                name,
                address,
            });
            res.json({ id: Number(tenantId) });
        } catch (error) {
            next(error);
            return;
        }
    }

    async destroy(req: Request, res: Response, next: NextFunction) {
        const tenantId = req.params.id;
        if (isNaN(Number(tenantId))) {
            next(createHttpError(400, 'Invalid url param'));
            return;
        }

        try {
            await this.tenantService.deleteById(Number(tenantId));
            this.logger.info('Tenant has been deleted', {
                id: Number(tenantId),
            });
            res.json({ id: Number(tenantId) });
        } catch (error) {
            next(error);
            return;
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const tenants = await this.tenantService.getAll();
            this.logger.info('All tenant have been fetched');

            res.status(200).json(tenants);
        } catch (error) {
            next(error);
            return;
        }
    }

    async getOne(req: Request, res: Response, next: NextFunction) {
        const tenantId = req.params.id;

        if (isNaN(Number(tenantId))) {
            next(createHttpError(400, 'Invalid url param'));
            return;
        }

        try {
            const tenant = await this.tenantService.getById(Number(tenantId));
            if (!tenant) {
                next(createHttpError(400, "Tenant doesn't exist"));
                return;
            }

            this.logger.info('Tenant has been fetched');
            res.status(200).json(tenant);
        } catch (error) {
            next(error);
            return;
        }
    }
}
