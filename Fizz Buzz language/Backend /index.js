/* *
 * I used the basic boilerplate code provided by the Alexa developer console in order to code
 * a voice-controlled version of the infamous Fizz Buzz math game
 * */

 const Alexa = require('ask-sdk-core');

 // currentNum is a global variable that keeps track of what number the fizz buzz game is at
let currentNum = 1;

// The LaunchRequestHandler handles the launching of this skill by invocation name Fizz Buzz 
const LaunchRequestHandler = {
    // canHandle ensures that the request is a Launch Request
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        // at the start of every new game of Fizz Buzz currentNum is reset to 1
        currentNum = 1;
        // This provides the initial instructions for the Fizz Buzz Game
        const speakOutput = `Welcome to Fizz Buzz. We’ll each take turns counting up from one. 
                             However, you must replace numbers divisible by 3 with the word “fizz”
                             and you must replace numbers divisible by 5 with the word “buzz”. If a
                             number is divisible by both 3 and 5, you should instead say “fizz buzz”. 
                             If you get one wrong, you lose.
                             OK, I’ll start... One.`;
        
        // a remprompt is added just in case the user doesn't know what to do next
        const repromptOutput = 'Now you must decide what to say for the number 2';
        return handlerInput.responseBuilder
            .speak(handlerInput.requestEnvelope.request.locale)
            .reprompt(repromptOutput)
            .getResponse();
    }
};

/* The FizzBuzzIntentHandler is the core componenet of the backend of this Alexa skill.
*  This intent is activated or called with the utterance of a number or one of the keywords ("fizz", "buzz", or "fizz buzz")
*  This handler relies on two functions isFizzBuzz and sayFizzBuzz
*/
const FizzBuzzIntentHandler = {
    // canHandle ensures that the request is a FizzBuzzIntent based off the utterances
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'FizzBuzzIntent';
    },
    handle(handlerInput) {
        // this intent is called once the user gives an answer therefore currentNum is incremented by one since its is initialized to 1
        currentNum++;
        // the variable userInput stores the answer provided by the user in the response 
        var userInput;
        
        /* if a user said a number it should be stored in the number slot of the request
        *  else the user said a keyword in which case it is stored in the keyword slot of the request
        *  to avoid any errors in the voice interaction everything is lower case
        */ 
        if(handlerInput.requestEnvelope.request.intent.slots.number.value) {
            userInput = handlerInput.requestEnvelope.request.intent.slots.number.value.toLowerCase();
        }
        else {
            userInput = handlerInput.requestEnvelope.request.intent.slots.keyword.value.toLowerCase();
        }
        
        /* If the user says the correct answer which is checked by the isFizzBuzz function the currentNum is incremented and 
        *  the sayFizzBuzz function is called to determine what Alexa should say next
        *  Else if the user says the wrong answer currentNum is incremented and Alexa provides the correct response
        */
        if(isFizzBuzz(currentNum, userInput)) {
            // incremented since the user says the right answer
            currentNum++;
            const speakOutput = sayFizzBuzz(currentNum);
            // this responseBuilder outputs what Alexa should say based off the updated currentNum and ensures the session doesn't end
            return handlerInput.responseBuilder
            .speak(speakOutput)
            .withShouldEndSession(false)
            .getResponse();
        }
        else {
            const speakOutput = `I'm sorry the correct response was “${sayFizzBuzz(currentNum)}”. You lose! Thanks for playing Fizz Buzz. For another great Alexa game, check out Song Quiz!`;
            // this responseBuilder outputs the closing remarks of the skill and exits gracefully
            return handlerInput.responseBuilder
            .speak(speakOutput)
            .withShouldEndSession(true)
            .getResponse();
        }
    }
};

// isFizzBuzz takes as inputs the currentNum and the userInput and outputs a boolean if the user provides the right answer
function isFizzBuzz(n, userInput) {
    if(n % 3 === 0 && n % 5 !== 0) {
        return userInput === 'fizz';
    }
    else if (n % 5 === 0 && n % 3 !== 0) {
        return userInput === 'buzz';
    }
    else if(n % 3 === 0 && n % 5 === 0) {
        return userInput === 'fizz buzz';
    }
    else {
        return userInput === `${n}`;
    }
}

// sayFizzBuzz takes as input the currentNum and outputs a string of what Alexa should say on its turn
function sayFizzBuzz(n) {
    if(n % 3 === 0 && n % 5 !== 0) {
        return 'fizz';
    }
    else if (n % 5 === 0 && n % 3 !== 0) {
        return 'buzz';
    }
    else if(n % 3 === 0 && n % 5 === 0) {
        return 'fizz buzz';
    }
    else {
        return `${n}`;
    }
}

// The RepeatIntentHandler repeats the number Alexa just said in case the user didn't hear it, only if the skill is active
const RepeatIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RepeatIntent';
    },
    handle(handlerInput) {
        const speakOutput = `${sayFizzBuzz(currentNum)}`;
        // this intent shouldn't end the skill or change the currentNum
        return handlerInput.responseBuilder
        .speak(speakOutput)
        .withShouldEndSession(false)
        .getResponse();
    }
};


// The HelpIntentHandler responds to the help command when the skill is active
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You must keep track of what number we are on and decide what to say based off the rules of the game. If you are not sure take a guess';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// The CancelAndStopIntentHandler responds to the stop and cancel command when the skill is active
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Thank you for playing Fizz Buzz. I hope you enjoyed';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * This is part of the Amazon boilerplate code
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ignored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = `Sorry, I didn't understand what you said. Please say a number or one of the keywords for the Fizz Buzz game.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * This is part of the Amazon boilerplate code
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * This is part of the Amazon boilerplate code
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/**
 * This is part of the Amazon boilerplate code and I added the FizzBuzz and Repeat Intent Handlers
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        FizzBuzzIntentHandler,
        RepeatIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();