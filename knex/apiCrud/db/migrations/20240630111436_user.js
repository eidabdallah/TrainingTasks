const knex = require('../../db/knex');

exports.up = function (knex) {
    return knex.schema
        .createTable('users', function (table) {
            table.increments('id');
            table.string('name', 255).notNullable();
            table.string('email', 255).notNullable().unique();
            table.string('phoneNumber', 255).notNullable().unique();
            table.timestamp('createdAt').defaultTo(knex.fn.now());
            table.timestamp('updatedAt').defaultTo(knex.fn.now());
        })
};

exports.down = function (knex) {
    return knex.schema.dropTable('users');
};

exports.config = { transaction: false };