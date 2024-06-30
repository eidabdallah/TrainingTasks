const knex = require('../../db/knex');

exports.up = async function (knex) {
    return knex.schema.createTable('books', function (table) {
        table.increments('id');
        table.string('bookTitle', 255).notNullable();
        table.date('publishDate').notNullable();
        table.string('bookPdf', 255).notNullable();
        table.text('bookTags').notNullable();
        table.integer('availableUnits').notNullable().defaultTo(0);
        table.integer('unitPrice').notNullable();
        table.integer('authorId').unsigned().references('id').inTable('authors').onDelete('CASCADE');
        table.integer('publisherId').unsigned().references('id').inTable('publishers').onDelete('CASCADE');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('books');
};

exports.config = { transaction: false };
