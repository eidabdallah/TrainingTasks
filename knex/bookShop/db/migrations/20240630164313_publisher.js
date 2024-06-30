const knex = require('../../db/knex');

exports.up = function (knex) {
    return knex.schema.createTable('publishers', function (table) {
        table.increments('id');
        table.string('publisherName', 255).notNullable();
        table.date('establishDate').notNullable();
        table.boolean('isStillWorking').notNullable().defaultTo(true);
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('publishers');
};

exports.config = { transaction: false };
