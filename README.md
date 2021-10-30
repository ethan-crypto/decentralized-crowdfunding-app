# decentralized-crowdfunding-app
A decentralized crowdfunding application named "Make it Happen". It is powered by IPFS and Ethereum smart contracts and interacts with a mock DAI stable coin.

**Overview of the protocol:**

Funding for every project is all or nothing, meaning that creators won’t receive any funds that their supporters contributed to their project unless it meets its funding goal. The funding goal is set by the creator of the project. When creating a new project, the creator sets how much money they need to raise and how much time they have to raise it. The project length is set in day long time increments and the project can’t last longer than 60 days. Creators also can’t contribute funds to their own projects. 

Every project also has a name, description and image. The name and description are stored on the blockchain directly while the images themselves are stored on IPFS and the reference to those images are stored on the blockchain. 

If a project meets its funding goal, creators can claim their collected funds for a fee. The fee amount is equal to the collected project funds multiplied by the fee percent and is taken out of the collected funds and transferred to a fee account. This fee account is set by the deployer of the smart contracts.

If, however, a project fails to meet its funding goal, supporters can claim a refund for the total amount they contributed to the project. 

**Overview of the user interface:**

The navbar contains the name of the application, followed by the address of the account connected to the app and then that accounts dai balance. 

The content of the UI is broken up into five different components: Discover, My Contributions, Transactions, My Projects and Create Project.

The Discover component lists all the open projects that weren’t created by the user. Each project is represented by a card component with the card header displaying the creator's account address. The card content contains an unordered list element. The first listed element displays all the qualitative data such as the project's image, name and description. The second listed element displays all the quantitative data such as the project's funding information, number of supporters and time left. Lastly, the third listed element contains an input field and a button titled “Contribute” that users can use to contribute however much they would like to that particular project.  

The My Contributions component contains all of the user's contributions divided into 3 separate tabs: Pending Refund, Held and Released. Each tab contains a table that lists each contribuition within a table row that shows the name of the project its associated with, its amount, its supporter number and its timestamp. Each project name is color coded according to the status of the project: blue for open, red for failed, yellow for pending transfer, green for successful and grey for cancelled. Clicking on any of the table rows will trigger a popover that displays all the relevant information about the project in the same format as the projects listed in the disover tab. The Pending Refund tab contains all the contributions that are refundable becuase the project it supported either failed or cancelled. This tab also contains a “Refund All” button that is located above the contributions table that triggers all the contributions listed to be refunded back to the users wallet, thus clearing the Pending Refunds tab of content for the time being. The Held tab contains all the contributions that are locked in a particular project until it meets some condition. This would include all the contributions to projects that are open or pending transfer. The Released tab contains all the contributions that have been released from the crowdfunding contract. These include the contributions that have been refunded by the supporter or part of the collected contributions of a successful project that was claimed by its creator. 

The Transactions component contains all the transactions divided into 3 seperate tabs: Transfers, Contributions and Refunds. Each tab contains a table that lists each transaction within a table row that shows the name of the project its associated with, its amount and its timestamp. As with the My Contributions component, each project name is color coded according to the status of the project. The table in the Transfers tab also shows the fee amount. Clicking on a table row, like with My Contributions, will trigger a popover that displays the project associated that transaction. 

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
