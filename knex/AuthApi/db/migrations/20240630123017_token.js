const knex = require('../../db/knex.js');

exports.up = function (knex) {
    return knex.schema.createTable('tokens', function (table) {
        table.increments('id').primary();
        table.string('token').notNullable();
        table.integer('user_id').unsigned().notNullable();
        table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
        table.date('expiresAt').notNullable();
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('tokens');
};

exports.config = { transaction: false };