import { Request, Response, NextFunction } from 'express';

// Extendemos la interfaz Request para incluir el usuario
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                // Otros campos del usuario que necesites
            };
        }
    }
}

export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Obtener el token del header
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }

        // Aquí normalmente verificarías el token con Firebase/JWT
        // Por ahora, solo para pruebas, asumimos que el token es válido
        // y asignamos un ID de usuario de prueba
        req.user = {
            id: 'usuario_de_prueba'
        };

        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido' });
    }
}; 