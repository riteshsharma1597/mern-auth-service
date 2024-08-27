import { NextFunction, Request, Response } from 'express';
import { TenantService } from '../services/TenantService';
import { Logger } from 'winston';
import { validationResult } from 'express-validator';

export class TenantController {
    constructor(
        private tenantService: TenantService,
        private logger: Logger,
    ) {}
    async create(req: Request, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
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
}
