const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Sequelize = require('sequelize');
const { STRING } = Sequelize;
const config = {
  logging: false,
};

//this allows remote control of logging
if (process.env.LOGGING) {
  delete config.logging;
}
const conn = new Sequelize(
  process.env.DATABASE_URL || 'postgres://localhost/acme_db',
  config
);

//models---------------------------------------------------
const User = conn.define('user', {
  username: STRING,
  password: STRING,
});

const Note = conn.define('note', {
  text: STRING,
});

Note.belongsTo(User);
User.hasMany(Note);

//hooks------------------------------------------------
User.addHook('beforeSave', async (user) => {
  if (user.changed('password')) {
    const hashed = await bcrypt.hash(user.password, 3);
    user.password = hashed;
  }
});

//class methods---------------------------------------
User.byToken = async (token) => {
  try {
    const payload = await jwt.verify(token, process.env.JWT);
    const user = await User.findByPk(payload.id, {
      attributes: {
        exclude: ['password'],
      },
    });
    if (user) {
      return user;
    }
    const error = Error('bad credentials');
    error.status = 401;
    throw error;
  } catch (ex) {
    const error = Error('bad credentials');
    error.status = 401;
    throw error;
  }
};

User.authenticate = async ({ username, password }) => {
  //authenticate returns a jwt, called in api
  //if 2 servers use the same secret key, same jwt works in both
  //jwt allows auth token to be stored in client
  const user = await User.findOne({
    where: {
      username,
    },
  }); //bcrypt next subject
  if (user && (await bcrypt.compare(password, user.password))) {
    //jwt.sign returns token
    return jwt.sign({ id: user.id }, process.env.JWT);
  }
  const error = Error('bad credentials!!!!!!');
  error.status = 401;
  throw error;
};

//seed db----------------------------------------
const syncAndSeed = async () => {
  await conn.sync({ force: true });
  const credentials = [
    { username: 'lucy', password: 'lucy_pw' },
    { username: 'moe', password: 'moe_pw' },
    { username: 'larry', password: 'larry_pw' },
  ];
  const [lucy, moe, larry] = await Promise.all(
    credentials.map((credential) => User.create(credential))
  );
  const notes = [
    { text: 'buy bread', userId: lucy.id },
    { text: 'text ricky', userId: lucy.id },
    { text: 'email moe', userId: larry.id },
  ];
  await Promise.all(notes.map((note) => Note.create(note)));
  return {
    users: {
      lucy,
      moe,
      larry,
    },
  };
};

module.exports = {
  syncAndSeed,
  models: {
    User,
    Note,
  },
};
