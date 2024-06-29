import authorModel from './model/authorModel.js';
import bookModel from './model/bookModel.js';
import buyerModel from './model/buyerModel.js';
import publisherModel from './model/publisherModel.js';
import reserveModel from './model/reserveModel.js';

const Relations = () => {
    bookModel.belongsToMany(buyerModel, { through: reserveModel });
    buyerModel.belongsToMany(bookModel, { through: reserveModel });

    authorModel.hasMany(bookModel, { onDelete: 'CASCADE' });
    bookModel.belongsTo(authorModel);

    publisherModel.hasMany(bookModel, { onDelete: 'CASCADE' });
    bookModel.belongsTo(publisherModel);
};

export default Relations;
