const knex = require('../../db/knex');

exports.up = function (knex) {
    return knex.schema.createTable('temporaryReserves', function (table) {
        table.increments('id');
        table.string('BookInfo', 255).notNullable();
        table.integer('NumberOfUnits').notNullable();
        table.string('buyerName', 255).nullable();
        table.string('phoneNumber', 255).nullable();
        table.string('buyerAddress', 255).nullable();
        table.integer('nationalID').nullable();
        table.date('purchaseDate').nullable();
        table.integer('price').notNullable();
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('temporaryReserves');
};

exports.config = { transaction: false };
