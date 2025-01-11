const winston = require('winston');
const path = require('path');

// Fonction factory pour créer un logger avec un tag spécifique
const createLogger = (tag) => {
	return winston.createLogger({
		level: 'info',
		format: winston.format.combine(
			winston.format.timestamp(),
			winston.format.json(),
			winston.format.metadata({ fillWith: ['timestamp', 'tag'] }), // Ajoute le tag aux métadonnées
		),
		defaultMeta: { tag }, // Tag par défaut pour tous les logs de cette instance
		transports: [
			// Logs d'erreur spécifiques au controller
			new winston.transports.File({ 
				filename: path.join('logs', tag, 'error.log'),
				level: 'error'
	  		}),
	  		new winston.transports.File({ 
				filename: path.join('logs', 'app', 'error.log'),
				level: 'error'
	  		}),
			// Tous les logs spécifiques au controller
			new winston.transports.File({ 
				filename: path.join('logs', tag, 'combined.log')
			}),
			new winston.transports.File({ 
				filename: path.join('logs', 'app', 'combined.log')
			}),
			// Console en développement
			...(process.env.NODE_ENV !== 'production' 
				? [new winston.transports.Console({
					format: winston.format.combine(
						winston.format.colorize(),
						winston.format.simple()
					)
					})] 
				: [])
		]
  	});
};

// Exporte des instances préconfigurées pour chaque controller
module.exports = {
	databaseLogger: createLogger('database'),
	quoteLogger: createLogger('quote'),
	contractLogger: createLogger('contract'),
};