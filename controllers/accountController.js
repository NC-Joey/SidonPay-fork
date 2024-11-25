const axios = require('axios');

const createAccount = async () => {
  const url = 'https://api.sandbox.getanchor.co/api/v1/accounts';
  const apiKey = 'CpGcX.81ba6d12e952a6734d59c99a71786580e79a00e84d39fd977fff2454e568c09f76a2982464f0921da61f45c5e1912420ddf8';

  const data = {
    data: {
      attributes: {
        productName: 'SAVINGS'
      },
      relationships: {
        customer: {
          data: {
            id: '173065499172115-anc_ind_cst',
            type: 'IndividualCustomer'
          }
        }
      },
      type: 'DepositAccount'
    }
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'x-anchor-key': apiKey
      }
    });
    console.log('Account created:', response.data);
  } catch (error) {
    console.error('Error creating account:', error.message);
  }
};

module.exports ={
    createAccount
}
