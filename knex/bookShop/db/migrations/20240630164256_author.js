const knex = require('../../db/knex');

exports.up = async function (knex) {

    return knex.schema.createTable('authors', function (table) {
        table.increments('id');
        table.string('firstName', 255).notNullable();
        table.string('middleName', 255).nullable();
        table.string('lastName', 255).notNullable();
        table.date('birthDate').notNullable();
        table.string('countryOfResidence', 255).notNullable();
        table.date('deathDate').nullable();
        table.string('officialWebsite', 255).notNullable();
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('authors');
};

exports.config = { transaction: false };
