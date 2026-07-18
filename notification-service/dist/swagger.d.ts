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
            Notification: {
                type: string;
                properties: {
                    id: {
                        type: string;
                        format: string;
                    };
                    userId: {
                        type: string;
                        format: string;
                    };
                    type: {
                        type: string;
                        enum: string[];
                    };
                    title: {
                        type: string;
                    };
                    message: {
                        type: string;
                    };
                    appointmentId: {
                        type: string;
                        format: string;
                    };
                    emailSent: {
                        type: string;
                    };
                    isRead: {
                        type: string;
                    };
                    createdAt: {
                        type: string;
                        format: string;
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