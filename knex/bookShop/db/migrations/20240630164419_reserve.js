const knex = require('../../db/knex');

exports.up = function (knex) {
    return knex.schema.createTable('reserves', function (table) {
        table.increments('id');
        table.date('purchaseDate').notNullable();
        table.integer('numberOfUnit').notNullable();
        table.integer('totalPrice').notNullable();
        table.string('PaymentMethod', 255).notNullable();
        table.integer('buyerId').unsigned().references('id').inTable('buyers');
        table.integer('bookId').unsigned().references('id').inTable('books');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('reserves');
};

exports.config = { transaction: false };
