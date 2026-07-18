// ======================================================
// Vocabulary Trainer
// app.js
// Part 1
// ======================================================

"use strict";

// ======================================================
// DATA
// ======================================================

const STORAGE_KEY = "vocabularyTrainer";

let app = {
    languages: [],
    vocabulary: [],
    editingId: null
};

// ======================================================
// DOM
// ======================================================

const editorPage = document.getElementById("editorPage");
const practicePage = document.getElementById("practicePage");

const tabEditor = document.getElementById("tabEditor");
const tabPractice = document.getElementById("tabPractice");

const languageSelect = document.getElementById("languageSelect");
const practiceLanguage = document.getElementById("practiceLanguage");

const newLanguageButton = document.getElementById("newLanguageButton");

const languageDialog = document.getElementById("languageDialog");
const newLanguageInput = document.getElementById("newLanguageInput");
const saveLanguageButton = document.getElementById("saveLanguageButton");
const cancelLanguageButton = document.getElementById("cancelLanguageButton");

// editor

const wordInput = document.getElementById("wordInput");
const meaningInput = document.getElementById("meaningInput");
const exampleContainer = document.getElementById("exampleContainer");

const saveButton = document.getElementById("saveButton");

const vocabularyList = document.getElementById("vocabularyList");

const searchInput = document.getElementById("searchInput");

// import / export

const exportButton = document.getElementById("exportButton");
const importButton = document.getElementById("importButton");
const importFile = document.getElementById("importFile");

// ======================================================
// START
// ======================================================

window.addEventListener("DOMContentLoaded", init);

function init() {

    load();

    if (app.languages.length === 0) {

        app.languages.push("Default");

        save();
    }

    renderLanguages();

    createExampleField();

    bindEvents();

    renderVocabulary();

}

// ======================================================
// EVENTS
// ======================================================

function bindEvents() {

    tabEditor.addEventListener("click", showEditor);

    tabPractice.addEventListener("click", showPractice);

    newLanguageButton.addEventListener("click", () => {

        newLanguageInput.value = "";

        languageDialog.showModal();

    });

    cancelLanguageButton.addEventListener("click", () => {

        languageDialog.close();

    });

    saveLanguageButton.addEventListener("click", saveLanguage);

    searchInput.addEventListener("input", renderVocabulary);

}

// ======================================================
// STORAGE
// ======================================================

function save() {

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(app)

    );

}

function load() {

    const data = localStorage.getItem(STORAGE_KEY);

    if (!data)
        return;

    try {

        app = JSON.parse(data);

    }

    catch {

        alert("Could not load saved data.");

    }

}

// ======================================================
// LANGUAGE
// ======================================================

function saveLanguage() {

    const name = newLanguageInput.value.trim();

    if (name.length === 0)
        return;

    if (app.languages.includes(name)) {

        alert("Language already exists.");

        return;

    }

    app.languages.push(name);

    app.languages.sort();

    save();

    renderLanguages();

    languageSelect.value = name;

    practiceLanguage.value = name;

    languageDialog.close();

}

function renderLanguages() {

    languageSelect.innerHTML = "";

    practiceLanguage.innerHTML = "";

    app.languages.forEach(language => {

        const option1 = document.createElement("option");

        option1.value = language;

        option1.textContent = language;

        languageSelect.appendChild(option1);

        const option2 = document.createElement("option");

        option2.value = language;

        option2.textContent = language;

        practiceLanguage.appendChild(option2);

    });

}

// ======================================================
// PAGE SWITCHING
// ======================================================

function showEditor() {

    editorPage.classList.remove("hidden");

    practicePage.classList.add("hidden");

    tabEditor.classList.add("active");

    tabPractice.classList.remove("active");

}

function showPractice() {

    editorPage.classList.add("hidden");

    practicePage.classList.remove("hidden");

    tabPractice.classList.add("active");

    tabEditor.classList.remove("active");

}

// ======================================================
// EXAMPLE SENTENCES
// ======================================================

function createExampleField(value = "") {

    const textarea = document.createElement("textarea");

    textarea.rows = 3;

    textarea.placeholder =
        "Ich {mache} heute bei dem Spiel {mit}.";

    textarea.className = "example";

    textarea.value = value;

    exampleContainer.appendChild(textarea);

}

// ======================================================
// PLACEHOLDERS
// ======================================================

function renderVocabulary() {

    vocabularyList.innerHTML = "";

    const div = document.createElement("div");

    div.className = "placeholder";

    div.textContent =
        "No vocabulary yet.";

    vocabularyList.appendChild(div);

}

// ======================================================
// UUID
// ======================================================

function uuid() {

    if (crypto && crypto.randomUUID) {

        return crypto.randomUUID();

    }

    return Date.now()
        + "-"
        + Math.random()
        .toString(36)
        .substring(2);

}

// ======================================================
// EDITOR
// Part 2
// ======================================================


// ======================================================
// DOM (EDITOR EXTENSIONS)
// ======================================================

const addExampleButton =
    document.getElementById("addExampleButton");


// ======================================================
// EDITOR EVENTS
// ======================================================

addExampleButton.addEventListener(
    "click",
    () => createExampleField()
);


saveButton.addEventListener(
    "click",
    saveVocabulary
);


// ======================================================
// SAVE VOCABULARY
// ======================================================

function saveVocabulary() {

    const language = languageSelect.value;

    const word =
        wordInput.value.trim();

    const meaning =
        meaningInput.value.trim();


    if (!word || !meaning) {

        alert(
            "Word and meaning are required."
        );

        return;

    }


    const examples =
        [...document.querySelectorAll(".example")]
        .map(e => e.value.trim())
        .filter(e => e.length > 0);



    if (examples.length === 0) {

        alert(
            "At least one example sentence is required."
        );

        return;

    }


    for (const example of examples) {

        if (!validateExample(example)) {

            alert(
                "Invalid example:\n\n" +
                example
            );

            return;

        }

    }



    const vocabulary = {

        id:
            app.editingId ??
            uuid(),

        language,

        word,

        meaning,

        examples:
            examples.map(parseExample),

        created:
            Date.now()

    };



    // EDIT EXISTING

    if (app.editingId) {


        const index =
            app.vocabulary.findIndex(
                v =>
                v.id === app.editingId
            );


        if (index !== -1) {

            app.vocabulary[index] =
                vocabulary;

        }


    }


    // CREATE NEW

    else {

        app.vocabulary.push(
            vocabulary
        );

    }



    resetEditor();

    save();

    renderVocabulary();

}



// ======================================================
// PARSER
// ======================================================

function parseExample(text) {

    const parts = [];

    const regex = /\{([^{}]+)\}/g;

    let lastIndex = 0;

    let match;


    while (
        (match = regex.exec(text)) !== null
    ) {


        // Text vor dem markierten Wort

        if (match.index > lastIndex) {

            parts.push({

                type: "text",

                value:
                    text.substring(
                        lastIndex,
                        match.index
                    )

            });

        }


        // markierter Teil

        parts.push({

            type: "answer",

            value:
                match[1]

        });


        lastIndex =
            regex.lastIndex;

    }



    // Rest nach letzter Markierung

    if (lastIndex < text.length) {

        parts.push({

            type: "text",

            value:
                text.substring(
                    lastIndex
                )

        });

    }



    return {

        original:
            parts
            .map(
                p => p.value
            )
            .join(""),



        hidden:
            parts
            .map(
                p =>

                p.type === "answer"

                ?

                "_____"

                :

                p.value

            )
            .join(""),



        answer:
            parts
            .filter(
                p =>
                p.type === "answer"
            )
            .map(
                p =>
                p.value
            )
            .join(" "),



        parts

    };

}



// ======================================================
// VALIDATION
// ======================================================

function validateExample(text) {


    const open =
        (text.match(/\{/g) || [])
        .length;


    const close =
        (text.match(/\}/g) || [])
        .length;



    if (open !== close)
        return false;



    if (open === 0)
        return false;



    if (/\{\s*\}/.test(text))
        return false;



    return true;

}



// ======================================================
// RESET EDITOR
// ======================================================

function resetEditor() {


    wordInput.value = "";

    meaningInput.value = "";

    exampleContainer.innerHTML = "";


    createExampleField();



    app.editingId = null;


    saveButton.textContent =
        "Save Vocabulary";

}



// ======================================================
// DISPLAY VOCABULARY
// ======================================================

function renderVocabulary() {


    vocabularyList.innerHTML = "";


    const search =
        searchInput.value
        .toLowerCase();



    const filtered =
        app.vocabulary.filter(v => {


            return (

                v.word
                .toLowerCase()
                .includes(search)

                ||

                v.meaning
                .toLowerCase()
                .includes(search)

                ||

                v.language
                .toLowerCase()
                .includes(search)

            );


        });



    if (filtered.length === 0) {

        vocabularyList.innerHTML =
            "<p>No vocabulary found.</p>";

        return;

    }



    filtered.forEach(v => {


        const card =
            document.createElement("div");


        card.className =
            "vocabulary-item";



        card.innerHTML = `

            <h3>${escapeHTML(v.word)}</h3>

            <p>
                ${escapeHTML(v.meaning)}
            </p>

            <small>
                ${escapeHTML(v.language)}
            </small>

            <br><br>

            <button class="edit">
                Edit
            </button>

            <button class="delete">
                Delete
            </button>

        `;



        card
        .querySelector(".edit")
        .addEventListener(
            "click",
            () =>
            editVocabulary(v.id)
        );



        card
        .querySelector(".delete")
        .addEventListener(
            "click",
            () =>
            deleteVocabulary(v.id)
        );



        vocabularyList.appendChild(card);


    });


}



// ======================================================
// EDIT
// ======================================================

function editVocabulary(id) {


    const vocabulary =
        app.vocabulary.find(
            v =>
            v.id === id
        );


    if (!vocabulary)
        return;



    app.editingId =
        vocabulary.id;



    languageSelect.value =
        vocabulary.language;


    wordInput.value =
        vocabulary.word;


    meaningInput.value =
        vocabulary.meaning;



    exampleContainer.innerHTML =
        "";



    vocabulary.examples.forEach(
        e => {


            createExampleField(
                convertBackToBrackets(e)
            );


        }
    );



    saveButton.textContent =
        "Update Vocabulary";



    window.scrollTo(
        {
            top:0,
            behavior:"smooth"
        }
    );


}



// ======================================================
// DELETE
// ======================================================

function deleteVocabulary(id) {


    const ok =
        confirm(
            "Delete this vocabulary?"
        );


    if (!ok)
        return;



    app.vocabulary =
        app.vocabulary.filter(
            v =>
            v.id !== id
        );



    save();

    renderVocabulary();

}



// ======================================================
// CONVERT STORED EXAMPLE BACK
// ======================================================

function convertBackToBrackets(example) {


    // neue gespeicherte Version

    if (example.parts) {


        return example.parts
            .map(
                part => {


                    if (
                        part.type === "answer"
                    ) {

                        return (
                            "{"
                            +
                            part.value
                            +
                            "}"
                        );

                    }


                    return part.value;

                }
            )
            .join("");

    }



    // Fallback für alte gespeicherte Daten

    return example.original;

}



// ======================================================
// HTML SAFETY
// ======================================================

function escapeHTML(text) {


    return text
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");

}

// ======================================================
// EXPERT MODE
// Part 3
// ======================================================


// ======================================================
// PRACTICE DOM
// ======================================================

const practiceMode =
    document.getElementById("practiceMode");

const startPractice =
    document.getElementById("startPractice");

const practiceCard =
    document.getElementById("practiceCard");

const practiceTitle =
    document.getElementById("practiceTitle");

const questionArea =
    document.getElementById("questionArea");

const answerInput =
    document.getElementById("answerInput");

const answerArea =
    document.getElementById("answerArea");

const showAnswerButton =
    document.getElementById("showAnswerButton");

const nextButton =
    document.getElementById("nextButton");



// ======================================================
// ANSWER DISPLAY FLAG
// ======================================================

let showExamplesAfterAnswer = false;
// ======================================================
// PRACTICE STATE
// ======================================================

let practice = {

    mode: null,

    cards: [],

    current: null

};



// ======================================================
// START PRACTICE
// ======================================================

startPractice.addEventListener(
    "click",
    startPracticeSession
);



function startPracticeSession() {


    const language =
        practiceLanguage.value;



    const mode =
        practiceMode.value;



    practice.mode =
        mode;



    practice.cards =
        app.vocabulary.filter(
            v =>
            v.language === language
        );



    if (practice.cards.length === 0) {

        alert(
            "No vocabulary available."
        );

        return;

    }



    practiceCard.classList.remove(
        "hidden"
    );


    nextPracticeCard();

}



// ======================================================
// NEXT CARD
// ======================================================

nextButton.addEventListener(
    "click",
    nextPracticeCard
);





// ======================================================
// EXPERT QUESTION
// ======================================================

function showExpertQuestion() {


    practiceTitle.textContent =
        "Expert Mode";



    const examples =
        practice.current.examples;



    const example =
        examples[
            Math.floor(
                Math.random()
                *
                examples.length
            )
        ];



    practice.currentExample =
        example;



    questionArea.innerHTML =
        `

        <p class="question">

        ${escapeHTML(example.hidden)}

        </p>

        `;


}



// ======================================================
// SHOW ANSWER
// ======================================================

showAnswerButton.addEventListener(
    "click",
    showCurrentAnswer
);





// ======================================================
// CHECK ANSWER
// ======================================================



function checkExpertAnswer() {


    if (!practice.currentExample)
        return;



    const userAnswer =
        normalizeAnswer(
            answerInput.value
        );



    const correctAnswer =
        normalizeAnswer(
            practice.currentExample.answer
        );



    if (
        userAnswer === correctAnswer
    ) {


        answerArea.innerHTML =
        `

        <p class="correct">

        Correct!

        </p>

        `;


    }

    else {


        answerArea.innerHTML =
        `

        <p class="wrong">

        Wrong.

        Correct:
        <strong>
        ${escapeHTML(
            practice.currentExample.answer
        )}
        </strong>

        </p>

        `;


    }


}



// ======================================================
// ANSWER NORMALIZATION
// ======================================================

function normalizeAnswer(text) {


    return text

        .trim()

        .toLowerCase()

        .replace(
            /\s+/g,
            " "
        );

}



// ======================================================
// IMPROVED PARSER
// ======================================================

function parseBrackets(text) {


    const parts = [];

    let cleanText = "";

    let answer = [];



    let index = 0;



    while(index < text.length) {


        if(text[index] === "{") {


            const end =
                text.indexOf(
                    "}",
                    index
                );



            if(end === -1) {

                return null;

            }



            const hidden =
                text.substring(
                    index + 1,
                    end
                );



            parts.push({

                type:"hidden",

                value:hidden

            });



            answer.push(hidden);



            cleanText += hidden;



            index =
                end + 1;



        }


        else {


            parts.push({

                type:"text",

                value:text[index]

            });



            cleanText += text[index];

            index++;

        }


    }



    return {

        original:
            cleanText,

        answer:
            answer.join(" "),

        hidden:
            parts
            .map(
                p =>
                p.type === "hidden"
                ?
                "_____"
                :
                p.value
            )
            .join("")

    };


}



// ======================================================
// EXPORT FOR DEBUGGING
// ======================================================

window.VocabularyTrainer = {

    app,

    practice,

    parseBrackets

};

// ======================================================
// NORMAL PRACTICE MODES
// Part 4
// ======================================================


// ======================================================
// PRACTICE SESSION STATE EXTENSION
// ======================================================

practice.usedCards = [];


// ======================================================
// REPLACE NEXT CARD FUNCTION
// ======================================================

function nextPracticeCard() {

    answerInput.value = "";

    answerArea.innerHTML = "";

    practice.currentExample = null;


    if (practice.cards.length === 0) {
        return;
    }


    /*
        Avoid showing the same card repeatedly
        until every vocabulary item was used once.
    */

    if (
        practice.usedCards.length >=
        practice.cards.length
    ) {

        practice.usedCards = [];

    }


    let available =
        practice.cards.filter(
            card =>
            !practice.usedCards.includes(card.id)
        );


    const random =
        Math.floor(
            Math.random()
            *
            available.length
        );


    practice.current =
        available[random];


    practice.usedCards.push(
        practice.current.id
    );



    switch(practice.mode) {


        case "expert":

            showExpertQuestion();

            break;


        case "meaning":

            showMeaningQuestion();

            break;


        case "word":

            showWordQuestion();

            break;


    }


}



// ======================================================
// MODE 1
// MEANING -> WORD
// ======================================================

function showMeaningQuestion() {


    practiceTitle.textContent =
        "Meaning → Word";


    questionArea.innerHTML =
    `

    <p class="question">

    ${escapeHTML(
        practice.current.meaning
    )}

    </p>

    `;


    practice.currentAnswer =
        practice.current.word;



    showExamplesAfterAnswer = true;

}



// ======================================================
// MODE 2
// WORD -> MEANING
// ======================================================

function showWordQuestion() {


    practiceTitle.textContent =
        "Word → Meaning";


    questionArea.innerHTML =
    `

    <p class="question">

    ${escapeHTML(
        practice.current.word
    )}

    </p>

    `;


    practice.currentAnswer =
        practice.current.meaning;


    showExamplesAfterAnswer = true;

}



// ======================================================
// SHOW ANSWER (EXTENDED)
// ======================================================

function showCurrentAnswer() {


    let answer =
        practice.currentAnswer;



    if (
        practice.mode === "expert"
        &&
        practice.currentExample
    ) {

        answer =
            practice.currentExample.answer;

    }



    if (!answer) {
        return;
    }



    let html =
    `

    <hr>

    <p>
    Correct answer:
    <strong>
    ${escapeHTML(answer)}
    </strong>
    </p>

    `;



    if (
        showExamplesAfterAnswer
        &&
        practice.current.examples
    ) {


        html +=
        `

        <p>
        Examples:
        </p>

        <ul>

        ${
            practice.current.examples
            .map(
                example =>
                `

                <li>
                ${escapeHTML(
                    example.original
                )}
                </li>

                `
            )
            .join("")
        }

        </ul>

        `;


    }



    answerArea.innerHTML =
        html;


}



// ======================================================
// CHECK NORMAL ANSWER
// ======================================================

function checkNormalAnswer() {


    if (!practice.currentAnswer) {
        return;
    }



    const user =
        normalizeAnswer(
            answerInput.value
        );


    const correct =
        normalizeAnswer(
            practice.currentAnswer
        );



    if(user === correct) {


        answerArea.innerHTML =
        `

        <p class="correct">
        Correct!
        </p>

        `;


    }

    else {


        answerArea.innerHTML =
        `

        <p class="wrong">

        Wrong.

        Correct:
        <strong>
        ${escapeHTML(
            practice.currentAnswer
        )}
        </strong>

        </p>

        `;

    }


}



// ======================================================
// KEYBOARD SUPPORT
// ======================================================

answerInput.addEventListener(
    "keydown",
    event => {

        if(event.key !== "Enter")
            return;


        if(answerArea.innerHTML) {

            nextPracticeCard();

            return;
        }


        if(practice.mode === "expert") {

            checkExpertAnswer();

        }
        else {

            checkNormalAnswer();

        }

    }
);





// ======================================================
// IMPORT / EXPORT + HELPERS
// Part 5
// ======================================================


// ======================================================
// IMPORT / EXPORT DOM
// ======================================================

exportButton.addEventListener(
    "click",
    exportJSON
);


importButton.addEventListener(
    "click",
    () => {

        importFile.click();

    }
);


importFile.addEventListener(
    "change",
    importJSON
);



// ======================================================
// EXPORT JSON
// ======================================================

function exportJSON() {


    const data = {

        version: 1,

        exported:
            new Date()
            .toISOString(),

        languages:
            app.languages,

        vocabulary:
            app.vocabulary

    };



    const json =
        JSON.stringify(
            data,
            null,
            4
        );



    const blob =
        new Blob(
            [
                json
            ],
            {
                type:
                "application/json"
            }
        );



    const url =
        URL.createObjectURL(
            blob
        );



    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        "vocabulary-backup.json";


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );

}



// ======================================================
// IMPORT JSON
// ======================================================

function importJSON(event) {


    const file =
        event.target.files[0];



    if (!file)
        return;



    const reader =
        new FileReader();



    reader.onload =
        function(e) {


            try {


                const data =
                    JSON.parse(
                        e.target.result
                    );



                if(
                    !validateImport(data)
                ) {


                    alert(
                        "Invalid vocabulary file."
                    );

                    return;

                }



                const replace =
                    confirm(

                        "Replace current vocabulary?\n\n" +
                        "Cancel = merge"

                    );



                if(replace) {


                    app.languages =
                        data.languages;


                    app.vocabulary =
                        data.vocabulary;


                }

                else {


                    mergeImport(
                        data
                    );


                }



                save();


                renderLanguages();

                renderVocabulary();



                alert(
                    "Import successful."
                );



            }

            catch(error) {


                alert(
                    "Could not read JSON file."
                );


                console.error(
                    error
                );

            }


        };



    reader.readAsText(
        file
    );


    // allow importing same file again

    importFile.value =
        "";

}



// ======================================================
// VALIDATE IMPORT
// ======================================================

function validateImport(data) {


    if(
        !Array.isArray(
            data.languages
        )
    )
        return false;



    if(
        !Array.isArray(
            data.vocabulary
        )
    )
        return false;



    for(
        const v of data.vocabulary
    ) {


        if(
            !v.id ||
            !v.word ||
            !v.meaning ||
            !v.language
        ) {

            return false;

        }


    }



    return true;

}



// ======================================================
// MERGE IMPORT
// ======================================================

function mergeImport(data) {



    data.languages
        .forEach(language => {


            if(
                !app.languages.includes(
                    language
                )
            ) {

                app.languages.push(
                    language
                );

            }


        });



    data.vocabulary
        .forEach(item => {


            const exists =
                app.vocabulary.some(
                    v =>
                    v.id === item.id
                );



            if(!exists) {


                app.vocabulary.push(
                    item
                );


            }


        });


}






// ======================================================
// TEXT NORMALIZATION
// ======================================================

function normalizeText(text) {


    return text

        .trim()

        .toLowerCase()

        .normalize(
            "NFD"
        )

        .replace(
            /[\u0300-\u036f]/g,
            ""
        )

        .replace(
            /\s+/g,
            " "
        );

}



// ======================================================
// DEEP COPY
// ======================================================

function clone(obj) {


    return JSON.parse(
        JSON.stringify(obj)
    );

}



// ======================================================
// DEBUG TOOLS
// ======================================================

window.exportVocabulary =
    exportJSON;


window.importVocabulary =
    importJSON;