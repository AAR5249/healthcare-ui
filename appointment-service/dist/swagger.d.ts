export declare const swaggerSpec: {
    openapi: string;
    info: {
        title: string;
        version: string;
        description: string;
    };
    servers: {
        url: string;
        description: string;
    }[];
    components: {
        securitySchemes: {
            bearerAuth: {
                type: string;
                scheme: string;
                bearerFormat: string;
            };
        };
        schemas: {
            Appointment: {
                type: string;
                properties: {
                    id: {
                        type: string;
                        format: string;
                    };
                    patientId: {
                        type: string;
                        format: string;
                    };
                    doctorId: {
                        type: string;
                        format: string;
                    };
                    date: {
                        type: string;
                        format: string;
                    };
                    startTime: {
                        type: string;
                    };
                    endTime: {
                        type: string;
                    };
                    status: {
                        type: string;
                        enum: string[];
                    };
                    reason: {
                        type: string;
                    };
                    notes: {
                        type: string;
                    };
                    createdAt: {
                        type: string;
                        format: string;
                    };
                    updatedAt: {
                        type: string;
                        format: string;
                    };
                };
            };
            TimeSlot: {
                type: string;
                properties: {
                    startTime: {
                        type: string;
                    };
                    endTime: {
                        type: string;
                    };
                    isAvailable: {
                        type: string;
                    };
                };
            };
            Error: {
                type: string;
                properties: {
                    success: {
                        type: string;
                        example: boolean;
                    };
                    error: {
                        type: string;
                    };
                    message: {
                        type: string;
                    };
                };
            };
        };
    };
};
//# sourceMappingURL=swagger.d.ts.map