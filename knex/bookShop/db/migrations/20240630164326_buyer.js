const knex = require('../../db/knex');

exports.up = function (knex) {
    return knex.schema.createTable('buyers', function (table) {
        table.increments('id');
        table.string('buyerName', 255).notNullable();
        table.string('phoneNumber', 255).notNullable();
        table.string('buyerAddress', 255).notNullable();
        table.integer('nationalID').notNullable();
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('buyers');
};

exports.config = { transaction: false };
