
const createUserName = (firstName)=>{
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const username = `${firstName.toLowerCase()}_${randomNum}`;
    
    return username;
}



module.exports = {
    createUserName
}