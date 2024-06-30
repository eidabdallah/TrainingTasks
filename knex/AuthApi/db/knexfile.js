// knexfile.js

module.exports = {
    development: {
        client: 'mysql2',
        connection: {
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'apiauth'
        },
        migrations: {
            tableName: 'knex_migrations'
        }
    },
    staging: {
        client: 'mysql2',
        connection: {
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'apiauth'
        },
        migrations: {
            tableName: 'knex_migrations'
        }
    },
    production: {
        client: 'mysql2',
        connection: {
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'apiauth'
        },
        migrations: {
            tableName: 'knex_migrations'
        }
    }
};
