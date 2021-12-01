# decentralized-crowdfunding-app

A decentralized "all or nothing" crowdfunding application named "Make it Happen". It is powered by IPFS and Ethereum smart contracts. It interacts with the DAI stable coin to accept payments and the Uniswap to give users the option to pay with DAI using ETH. 

### Overview of the protocol:

The main contract, Crowdfunder.sol has an external make project function that generates new Project.sol child contracts. These contracts are what hold the collected funds for every respective crowdfunding project. Project.sol only accepts the DAI stable coin as payment so that creators can feel confident that the funding goal they set for their projects will maintain equal value. The only address that can call Project.sol functions is the parent Crowdfunder.sol contract.

Funding for every project is all or nothing, meaning that project creators won’t receive any funds from their supporters unless their project meets its predefined funding goal. The funding goal is set by the creator of the project. When creating a new project, the creator sets how much money they need to raise and how much time they have to raise it. The project length can’t last longer than 60 days. Creators also can’t contribute funds to their own projects. 

Every project also has a name, description and image associated with it. The name and description are stored on the blockchain directly while the images themselves are stored on IPFS and the reference to those images are stored on the blockchain. 

If a project meets its funding goal, creators can claim their collected funds for a fee. The fee amount is equal to the collected project funds multiplied by the fee percent and is taken out of the collected funds and transferred to a fee account. This fee account is set by the deployer of the Crowdfunder.sol contract.

If, however, a project fails to meet its funding goal, supporters can claim a refund for the total amount they contributed to the project. 

### Overview of the user interface:

The navbar contains the name of the application, the user's dai balance and the address of the account connected to the app.
The content of the UI is broken up into 4 different components: Discover, My Contributions, Transactions and My Projects.

**Discover**

The Discover component lists all the open projects that weren’t created by the user. Each project is represented by a card component with the card header displaying the creator's account address. The card content contains an unordered list element. The first listed element displays all the qualitative data such as the project's image, name and description. The second listed element displays all the quantitative data such as the project's funding information, number of supporters and time left. Lastly, the third listed element contains an input field and a button titled “Contribute” that users can use to contribute however much DAI they would like to that particular project. If a user wants pay with ETH, they can choose to contribute DAI using their ETH by toggling the pay with ETH button located in the header of the Discover component. This button is toggled on by default if the users DAI balance is equal to 0. When its on, the user can type in the amount of DAI they want to contribute in the input field and right below it the approximate cost in ETH to execute that swap is displayed. 

**My Contributions**

The My Contributions component contains all of the user's contributions divided into 3 separate tabs: Pending Refund, Held and Released. Each tab contains a table that lists each contribuition within a table row that shows the name of the project its associated with, its amount, its supporter number and its timestamp. Each project name is color coded according to the status of the project: blue for open, red for failed, yellow for pending disburement, green for successful and grey for cancelled. Clicking on any of the table rows will trigger a popover that displays all the relevant information about the project in the same format as the projects listed in the Disover component. The Pending Refund tab contains all the contributions that are refundable becuase the project it supported either failed or cancelled. The Held tab contains all the contributions that are locked in a particular project until it meets some condition. This would include all the contributions to projects that are open or pending transfer. The Released tab contains all the contributions that have been released from the crowdfunding contract. These include the contributions that were refunded or disbured. 

**Transactions**

The Transactions component contains all the transactions divided into 3 seperate tabs: Disbursement, Contributions and Refunds. Each tab contains a table that lists each transaction within a table row that shows the name of the project its associated with, its amount and its timestamp. As with the My Contributions component, each project name is color coded according to the status of the project. The table in the Disburesement tab also shows the fee amount. Clicking on a table row, like with My Contributions, will trigger a popover that displays the project associated with that transaction. 

**My Projects**

Lastly the My Projects component displays all of the users projects. You can choose to view all projects or just the projects that are open, closed or pending disbursement using the view drop down button at the top of the component. Users can cancel any open project by pressing the cancel project button. If a user makes a project that does get successfully funded, than that user can claim the collected funds by pressing the disburse project funds button. Next to the view tab is the new tab which navigates users to a form which they can fill out to create a new project. 

### Usage
You neeed to install [Metamask Wallet](https://metamask.io/) extenstion into your browser and connect it to the app. Once connected, your address will show on the top navigation bar. Follow the Metamask prompts to complete transactions on the Dapp. 

### Tools and Tech Stack

* [Uniswap Protocol](https://uniswap.org/) - decenetralized exchange
* [Maker Dao](https://makerdao.com/en/) - protocol that birthed the DAI stable coin
* [Truffle](https://www.trufflesuite.com/) - development framework
* [React](https://reactjs.org/) - front end framework
* [React Redux](https://react-redux.js.org/) - state container 
* [Solidity](https://docs.soliditylang.org/en/v0.8.10/) - ethereum smart contract language
* [Ganache](https://www.trufflesuite.com/ganache) - local blockchain development
* [Web3](https://web3js.readthedocs.io/en/v1.5.2/) - library that interacts with ethereum nodes 
* [JavaScript](https://www.javascript.com/) - handle front end logic and testing smart contracts
* [IPFS](https://ipfs.io/) - decentralized file storage system
* [Infura](https://infura.io/) - connection to IPFS and ethereum networks 
* [Open Zeppelin](https://infura.io/) - smart contract libraries and test helpers 
### Preconfiguration, Installation and Running project locally 

You will need node installed, preferably version 17.0.1

1. Clone repository 
```sh
$ git clone https://github.com/ethan-crypto/decentralized-crowdfunding-app.git
```

2. Enter project directory and install dependancies
```sh
$ cd decentralized-crowdfunding-app
$ npm install 
```

3. Install truffle globally (preferrably truffle@v5.3.14)
```sh
$ npm install -g truffle
```

4. Install ganache globally 
```sh
$ npm install -g ganache-cli
```

5. Run local blockchain as a fork of Ethereum mainnet using ganache-cli and Infura. 
Allows us to work with the state of mainnet and deployed contracts on mainnet
Go to infura create a new project and copy the mainnet URL 
e.g Mainnet URL https://mainnet.infura.io/v3/11111111111111111
```sh
$ ganache-cli -f https://mainnet.infura.io/v3/11111111111111111

```
Above should run local blockchain with ganache. 
Ensure truffle-config.js networks config is your Ganache port. 
By default it should be host: 127.0.0.1 and port: 8545 

6. Connect your ganache addresses to Metamask! 
Copy private Key of the addresses in ganache and import to Metamask
Connect your metamask to network Localhost 8545

### Migrating contracts and Testing

1. To compile contracts e.g you make changes to contracts
```sh
$ truffle compile 
```

2. Migrate contracts to local running instance fork
```sh
$ truffle migrate --reset 
```

3. To test contracts 
```sh
$ truffle test
```
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

License
----
MIT
