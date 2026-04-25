const bcrypt = require('bcrypt');

const password = "Password123!";
bcrypt.hash(password, 10,async (err,hash) => {
    if(err){console.log('error')};
    if(hash) {console.log(hash)}
});