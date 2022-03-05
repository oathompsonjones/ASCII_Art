// Stores the characters used to draw each frame.
let density;
// Stores the video input object.
let video;
// Stores the HTML Div Element which renders each frame.
let asciiDiv;
// Stores the HTML Checkbox Element which allows the user to toggle between coloured or black and white.
let colouredCheckbox;
// Stores the HTML Checkbox Element which allows the user to toggle the actual video rendering.
let videoCheckbox;
// Stores the HTML Checkbox Element which allows the user to toggle the order of the density.
let reverseCheckbox;
// Stores the HTML Slider Element which allows the user to set the number of spaces to include in the density.
let whitespaceSlider;
// Stores the HTML Div Element which displays the label for the whitespace slider.
let whitespaceSliderText;
// Stores the HTML Button Element which allows the user to reset all the settings.
let resetButton;
// Stores the default settings, allowing the user to reset them.
const defaultOptions = {
    showVideo: false,
    coloured: false,
    reversed: false,
    whitespace: 15
};
// Stores the current settings.
const options = {
    get showVideo() { return videoCheckbox ? videoCheckbox.checked() : defaultOptions.showVideo; },
    get coloured() { return colouredCheckbox ? colouredCheckbox.checked() : defaultOptions.coloured; },
    get reversed() { return reverseCheckbox ? reverseCheckbox.checked() : defaultOptions.reversed; },
    get whitespace() { return whitespaceSlider ? whitespaceSlider.value() : defaultOptions.whitespace; }
};

// Updates certain values when the options are changed. 
function init() {
    // Hides any video that is currently being rendered,
    if (video) video.hide();

    // Creates a new video capture with the updated settings.
    video = createCapture({
        // The width and height are halved if the coloured option is enabled, in order to reduce the number of span tags and speed up the DOM rendering.
        video: {
            width: window.screen.width / 10 / (options.coloured + 1),
            height: window.screen.height / 15 / (options.coloured + 1)
        }, audio: false
    });

    // Checks if the video capture should be rendered.
    if (options.showVideo) video.show();
    else video.hide();

    // Updated the label for the whitespace slider.
    whitespaceSliderText.html(`Whitespace: ${options.whitespace}`);

    // Creates a string containing all the characters to appear in density, and adds the required number of spaces.
    const chars = " ".repeat(options.whitespace) + ".'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
    // Sets the density, reversing it if need be.
    density = options.reversed ? chars.split("").reverse().join("") : chars;
}

// Makes certain characters in the density string compatible with HTML.
function escapeChar(char) {
    return { " ": "&nbsp", "&": "&amp", "<": "&lt", ">": "&gt" }[ char ] || char;
}

// Runs when the program is first run, initialises most variables.
function setup() {
    // Disables the rendering of a canvas.
    noCanvas();

    // Creates the div which will render the text and adds the required CSS.
    asciiDiv = createDiv();
    asciiDiv.style("background-color", 0);
    asciiDiv.style("color", "#ffffff");

    // Creates the checkboxes for the settings, and provides the default values.
    videoCheckbox = createCheckbox("Show Video", defaultOptions.showVideo);
    colouredCheckbox = createCheckbox("Coloured", defaultOptions.coloured);
    reverseCheckbox = createCheckbox("Reverse Characters", defaultOptions.reversed);

    // Creates the whitespace slider, sets the default value, and creates the div to display the label.
    whitespaceSlider = createSlider(0, 50, defaultOptions.whitespace);
    whitespaceSliderText = createDiv();

    // Creates a button to reset all settings.
    resetButton = createButton("Reset");

    // Defines the behaviour for when the checkboxes and slider are modified. Each one calls the init function. 
    colouredCheckbox.changed(() => {
        options.coloured = !options.coloured;
        init();

    });
    videoCheckbox.changed(() => {
        options.showVideo = !options.showVideo;
        init();
    });
    reverseCheckbox.changed(() => {
        options.reversed = !options.reversed;
        init();
    });
    whitespaceSlider.input(() => {
        options.whiteSpace = whitespaceSlider.value();
        init();
    });

    // Defines the behaviour for when the reset button is pressed.
    resetButton.mousePressed(() => {
        videoCheckbox.checked(defaultOptions.showVideo);
        colouredCheckbox.checked(defaultOptions.coloured);
        reverseCheckbox.checked(defaultOptions.reversed);
        whitespaceSlider.value(defaultOptions.whitespace);
        init();
    });

    // Calls the init function to set finish teh setup process.
    init();
}

// Runs every frame.
function draw() {
    // Checks that the video capture has loaded properly.
    if (video.loadedmetadata) {
        // Loads the pixels coming from the capture.
        video.loadPixels();

        // Creates an empty string to store the text for this frame.
        let asciiImage = "";

        // Loops through each pixel.
        for (let j = 0; j < video.height; j++) {
            for (let i = 0; i < video.width; i++) {
                // Gets the index of the current pixel.
                const pixelIndex = (i + j * video.width) * 4;

                // Gets the RGB values for the current pixel.
                const [ r, g, b ] = video.pixels.slice(pixelIndex, pixelIndex + 4);

                // Calculates the brightness from the RGB values, maps it from 0-255 to 0-the number of indexes in density, gets the character for that index and escapes any characters which don't work in HTML.
                const c = escapeChar(density.charAt(round(map(0.299 * r + 0.587 * g + 0.114 * b, 0, 255, 0, density.length - 1))));

                // Checks if the current character should be coloured, then applies the CSS if needed, and adds it to the current string of characters.
                asciiImage += options.coloured ? `<span style="color: rgb(${r}, ${g}, ${b})">${c}</span>` : c;
            }
            // Adds an HTML break element at the end of each row of pixels.
            asciiImage += '<br/>';
        }
        // Sets the innerHTML property of the div which renders the full image.
        asciiDiv.html(asciiImage);
    }
}
