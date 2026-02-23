document.addEventListener("DOMContentLoaded", () => {

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    canvas.style.background = "black"

    document.addEventListener("keydown", function(e) {
            // prevent enter keypress in textareas
            if (e.key == "Enter" && document.activeElement.tagName == 'TEXTAREA') {
                e.preventDefault()
            }

            const regex = /[\d]|Backspace|Delete/
            const regex2 = /[\d]|Backspace|Delete|\./

            // only allow 0-9, backspace, delete, && ctrl+a
            if ((document.activeElement.className == "numbersOnly" && regex.test(e.key) != true) && (e.ctrlKey == false)) {
                e.preventDefault()
            }
            if ((document.activeElement.className == "numbersOnlyIncludePeriod" && regex.test(e.key) != true) && (e.ctrlKey == false)) {
                e.preventDefault()
            }
        }
    )

    // Set n slider to n text input, same as inverse
    // let nRangeText = document.getElementById("nRangeText")
    // let nRangeSlider = document.getElementById("nRangeSlider")
    // nRangeText.addEventListener("change", () => {nRangeSlider.value = nRangeText.value})

    function getInputs() {
        // console.log("function getInputs called");

        let numberOfVertices = Number(document.getElementById("numberOfVertices").value)
        // // console.log(numberOfVertices)

        // https://stackoverflow.com/a/15839451
        let rType = document.querySelector('input[name="rType"]:checked').value
        switch (rType) {
            case "rType1":
                rType = 0
                break;
            case "rType2":
                rType = 1
                break;
            case "rType3":
                rType = 2
                break;
        }
        // // console.log(rType)

        let nValue = document.getElementById("nRangeText").value
        // // console.log(nValue)

        let numOfPoints = document.getElementById("numOfPoints").value
        // // console.log(numOfPoints)

        let radius = document.getElementById("radius").value
        // // console.log(radius)

        let colorBool = document.getElementById("colorBool").checked

        let lightenBool = document.getElementById("lightenBool").checked


        let resultsArray = {numberOfVertices:numberOfVertices, rType:rType, nValue:nValue, numOfPoints:numOfPoints, radius:radius, colorBool:colorBool, lightenBool:lightenBool}
        // // console.log(typeof resultsArray)
        return resultsArray
    }

    let startButton = document.getElementById("startButton")
    startButton.addEventListener("click", () => {
        startDraw(getInputs())
    })

    function random(min, max) {
        // console.log("function random called");
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }

// From https://stackoverflow.com/a/9493060
function hue_to_rgb(p, q, t) {
    // console.log("function hue to rgb called");
    if (t < 0) {t = t + 1}
    if (t > 1) {t = t - 1}
    if (t < 1/6) { return (p + (q - p) * 6 * t) }
    if (t < 1/2) { return q }
    if (t < 2/3) { return (p + (q - p) * (2/3 - t) * 6) }
    return p
    }

    function hsl_to_rgb(h, s, l) {
// console.log("function hsl to rgb called");
    let p = 0
    let q = 0
    if (s == 0) {
        r = l
        g = l
        b = l
    }
    else {
        if (l < 0.5) {
            q = l * (1 + s)
        }
        else {
            q = l + s - l * s
        }
        p = 2 * l - q
        r = hue_to_rgb(p, q, (h + 1/3))
        g = hue_to_rgb(p, q, h)
        b = hue_to_rgb(p, q, (h - 1/3))
    }
        r = Math.round(r * 255)
        g = Math.round(g * 255)
        b = Math.round(b * 255)
    let rgbValue = {r:r, g:g, b:b}
    return rgbValue
    }

    // removes decimal, returns full number
    function truncate(truncate_number) {
        // console.log("function truncate called")
    if (truncate_number >= 0) {
        //force Math.round down
        return Math.round(truncate_number - .5)
    }
    else {
        //Math.round up since its negative
        return Math.round(truncate_number + .5)
    }
    }

    function calculate_offset(numberOfVertices, radius) {
        // console.log("function calculate offset called");
    // assume first point is min && max
    y_min = 500 + radius * Math.sin((-90 + (1 * 360 / numberOfVertices))* (Math.PI / 180))
    y_max = y_min

    // loop through the other vertices to find the actual min && max
    for (let i = 2; i <= numberOfVertices; i++) {
        current_y = 500 + radius * Math.sin((-90 + (i * 360 / numberOfVertices)) * (Math.PI / 180))
        if (current_y < y_min) {
            y_min = current_y
        }
        if (current_y > y_max) {
            y_max = current_y
        }
    }

    shape_height = y_max - y_min
    shape_center_y = y_min + (shape_height / 2)

    return 500 - shape_center_y
    }

    function get_vertex_coord(which_coord, vertex_index, numberOfVertices, radius) {
        // console.log("function get vertex coord called");
    if (which_coord == "x") {
        return 500 + radius * Math.cos((-90 + (vertex_index * 360 / numberOfVertices))* (Math.PI / 180))
    }
    if (which_coord == "y") {
        return (500 + radius * Math.sin((-90 + (vertex_index * 360 / numberOfVertices))* (Math.PI / 180)))+calculate_offset(numberOfVertices, radius)
    }

    }

    function vertex_to_angle(vertex_index, numberOfVertices) {
        // console.log("function vertex to angle called");
    let angle = (vertex_index * 360 / numberOfVertices)
        // make sure angle value is 0-360
    if (angle < 0) {
        angle = angle + 360
    }
    return angle
    }

    // 1 = most recent, 3 equals least recent
    function pick_vertex(restriction_type, numberOfVertices) {
        restriction_type = Number(restriction_type)
        // console.log("function pick vertex called");
    //restriction type 0 = no restrictions
    //restriction type 1 = cant be the same as pervious point
    //restriction type 2 = cannot be adjacent || the same as previous point
    let previous_vertex_index_1 = localStorage.getItem("previous_vertex_index_1")
    let previous_vertex_index_2 = localStorage.getItem("previous_vertex_index_2")
    let previous_vertex_index_3 = localStorage.getItem("previous_vertex_index_3")

    new_pick = 0
    is_valid_pick = 0
        while (is_valid_pick == 0) {
        new_pick = truncate((random(1, numberOfVertices)))
        is_valid_pick = 1

        if (restriction_type == 1) {
            if (new_pick == previous_vertex_index_1) {
            is_valid_pick = 0
            }
        }
        if (restriction_type == 2) {
            neighbor_plus_1 = previous_vertex_index_1 % numberOfVertices
            neighbor_plus_1 = neighbor_plus_1 + 1

            temp_minus = previous_vertex_index_1 - 2 + numberOfVertices
            neighbor_minus_1 = temp_minus % numberOfVertices
            neighbor_minus_1 = neighbor_minus_1 + 1

        if (new_pick == previous_vertex_index_1 || new_pick == neighbor_plus_1 || new_pick == neighbor_minus_1) {
            is_valid_pick = 0
        }
        }
    }


    localStorage.setItem("previous_vertex_index_3", previous_vertex_index_2)
    localStorage.setItem("previous_vertex_index_2", previous_vertex_index_1)
    localStorage.setItem("previous_vertex_index_1", new_pick)
    previous_vertex_index_3 = previous_vertex_index_2
    previous_vertex_index_2 = previous_vertex_index_1
    previous_vertex_index_1 = new_pick

    return new_pick
    }

    function lerp (x1, y1, x2, y2, n) {
        // console.log("function lerp");
        lerp_x = x1 + (x2 - x1) * n
        lerp_y = y1 + (y2 - y1) * n
        let lerpResults = {x:lerp_x, y:lerp_y}
        return lerpResults
    }

    // gets point distance to target vertex, takes that value, normalizes it, && adjusts the luminance based on the value
    // closer to target vertex = darker
    function adjust_luminance(point_x, point_y, vertex_x, vertex_y, radius) {
        // console.log("function adjust luminance called");
        dist = Math.sqrt (((vertex_x - point_x)**2) + ((vertex_y - point_y)**2))
        normalized_dist = dist / (2 * radius)
        return normalized_dist
    }

    function startDraw(inputArray) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // console.log("function startdraw called");
        localStorage.setItem("previous_vertex_index_1", 0)
        localStorage.setItem("previous_vertex_index_2", 0)
        localStorage.setItem("previous_vertex_index_3", 0)

        // start_x, start_y, restriction_type, n, num_of_points, color_bool, lighten_bool
        let current_x = 500
        let current_y = 500

        let current_r = 0
        let current_g = 0
        let current_b = 0

        let pointsDrawn = 0;

        function drawBatch() {
            let pointsPerFrame = Math.max(1, Math.floor(Math.log(pointsDrawn + 1)));

            for (let i = 0; i < pointsPerFrame; i++) {

                if (pointsDrawn >= inputArray.numOfPoints) {
                    return;
                }

                target_vertex = pick_vertex(inputArray.rType, inputArray.numberOfVertices)

                // Get the coordinates of the chosen vertex
                target_x = get_vertex_coord("x", target_vertex, inputArray.numberOfVertices, inputArray.radius)
                target_y = get_vertex_coord("y", target_vertex, inputArray.numberOfVertices, inputArray.radius)

                if (inputArray.colorBool == true) {
                    // Set color based on the chosen vertex
                    angle = vertex_to_angle(target_vertex, inputArray.numberOfVertices)

                    if (inputArray.lightenBool == true) {
                        adjusted_luminance = adjust_luminance(current_x, current_y, target_x, target_y, inputArray.radius)
                        let rgbResult = hsl_to_rgb(angle/360, 1, adjusted_luminance)
                        current_r = rgbResult.r
                        current_g = rgbResult.g
                        current_b = rgbResult.b
                    }
                    else {
                        let rgbResult = hsl_to_rgb(angle/360, 1, .5)
                        current_r = rgbResult.r
                        current_g = rgbResult.g
                        current_b = rgbResult.b
                    }
                //    pc r, g, b
                }
                else { // color_bool = false
                    current_r = 255
                    current_g = 255
                    current_b = 255
                }
                // Move a fraction of the way from the current point to the target vertex
                let lerpResults = lerp(current_x, current_y, target_x, target_y, inputArray.nValue)

                // The new position becomes the current position
                current_x = lerpResults.x
                current_y = lerpResults.y

                // Go to the new position && draw a small point
                // go current_x, current_y
                // console.log("start point draw")
                ctx.beginPath();
                ctx.arc(current_x, current_y, 2, 0, 2 * Math.PI);
                ctx.fillStyle = `rgb(${current_r}, ${current_g}, ${current_b})`;
                ctx.fill();
                // ctx.stroke();

                pointsDrawn++;
            }

            if (pointsDrawn < inputArray.numOfPoints) {
                requestAnimationFrame(drawBatch);
            }
        }

        drawBatch();
    }




    // const canvas = document.getElementById("canvas");
    // const ctx = canvas.getContext("2d");
    // ctx.beginPath()
    // ctx.arc(500, 500, 0.5, 0, 2 * Math.PI)
    // ctx.stroke()
})