// ... existing code ...

export function drawFig4(container) {
    // D3 setup
    margin = { top: 20, right: 120, bottom: 30, left: 50 }; // Assign values here
    width = 960 - margin.left - margin.right; // Assign values here
    height = 500 - margin.top - margin.bottom; // Assign values here

    // Clear previous SVG content if any
    container.select("svg").remove();

    svg = container.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    x = d3.scaleTime().range([0, width]);
    y = d3.scaleLinear().range([height, 0]);

    line = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.value))
        .defined(d => !isNaN(d.value) && d.value !== null); // Ignore NaN or null values

    // Initial load
    d3.json("data/fig4.json").then(jsonData => {
        data = jsonData;
        // Initial render with "Broad Fusion"
        groups = PRESET_DEFINITIONS.broad.groups;
        d3.select("#broad-fusion").classed("active", true);
        updateStoryBlock(PRESET_DEFINITIONS.broad.text);
        activePreset = 'broad';
        
        // Ensure initializeChart is called to setup SVG and tooltip
        initializeChart(); 
        renderChart();
        updateTopicButtonColors(); // Update button colors on initial load
    }).catch(error => {
        console.error("Error loading fig4.json:", error);
    });

// ... existing code ...

function initializeChart() {
    // Select the SVG element within the dedicated container
    const chartSvgElement = d3.select("#fig4-chart-svg"); // Corrected ID to match HTML

    // Clear any existing SVG content if redrawing
    chartSvgElement.selectAll("*").remove();

    svg = chartSvgElement
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Initialize scales
    x = d3.scaleTime().range([0, width]);
    y = d3.scaleLinear().range([height, 0]);

    // Initialize line generator (already defined globally)

    // Initialize tooltip - ensuring it uses the correct class from CSS
    tooltip = d3.select("body").append("div")
        .attr("class", "fig4-tooltip") // Use the class defined in CSS
        .style("opacity", 0)
        .style("position", "absolute")
        .style("pointer-events", "none"); // Ensure it doesn't block mouse events
}

// ... existing code ...

function renderChart() {
    svg.selectAll("*").remove(); // Clear previous chart elements

    const currentToken = generatePartGroupsToken(groups);
    console.log("Current Token:", currentToken);

    // 2. 用 token 精确抓数据
    const filteredData = data.filter(row => {
        // 将当前 token 和 row.PartGroups 都转换为标准格式进行比较
        const normalizeToken = (token) => {
            // 1. 分割成组
            const groups = token.split(',');
            // 2. 对每个组内的元素进行排序
            const sortedGroups = groups.map(group => {
                const elements = group.split(/[|,]/);
                return elements.sort((a,b) => a.localeCompare(b)).join('|');
            });
            // 3. 对组进行排序
            return sortedGroups.sort((a,b) => a.localeCompare(b)).join(',');
        };

        const normalizedCurrentToken = normalizeToken(currentToken);
        const normalizedRowToken = normalizeToken(row.PartGroups);
        
        console.log("Comparing:", {
            originalRowToken: row.PartGroups,
            normalizedRowToken: normalizedRowToken,
            originalCurrentToken: currentToken,
            normalizedCurrentToken: normalizedCurrentToken,
            matches: normalizedRowToken === normalizedCurrentToken
        });
        
        return normalizedRowToken === normalizedCurrentToken;
    });

    console.log("Filtered Data Length:", filteredData.length);
    if (filteredData.length > 0) {
        console.log("Sample Filtered Data:", filteredData[0]);
    }

    if (filteredData.length === 0) {
        svg.append("text")
            .attr("x", (width / 2))
            .attr("y", (height / 2))
            .attr("text-anchor", "middle")
            .text("No data for this combination.");
        return;
    }

    // Process data for lines
    const regions = ['NorthAmerica', 'Europe', 'Australasia'];
    const processedData = regions.map(regionKey => {
        return {
            name: regionKey,
            values: filteredData
                .filter(d => d.Region === regionKey)
                .map(d => ({
                    year: d3.timeParse("%Y")(d.Year),
                    value: +d.Diversity // Use Diversity field, ensure value is a number
                })).filter(d => d.value !== null && !isNaN(d.value)) // Filter out null/NaN values
        };
    });

    console.log("Processed Data:", processedData); // Log processed data to check content
    // Set domains based on valid data points
    const allValues = processedData.flatMap(s => s.values);

    // Update module-level validYearsGlobal and validValuesGlobal
    validYearsGlobal = allValues.map(d => d.year).filter(d => d !== null && !isNaN(d));
    validValuesGlobal = allValues.map(d => d.value).filter(d => d !== null && !isNaN(d));

    if (validYearsGlobal.length === 0 || validValuesGlobal.length === 0) {
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height / 2)
            .attr("text-anchor", "middle")
            .text("Insufficient valid data to draw chart.");
        return;
    }

    x.domain(d3.extent(validYearsGlobal));
    y.domain([
        d3.min(validValuesGlobal),
        d3.max(validValuesGlobal)
    ]);

    // Clear previous axes if they exist to prevent duplicates on re-render
    svg.selectAll(".x-axis").remove();
    svg.selectAll(".y-axis").remove();

    gx = svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y")));

    gy = svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y));

    // Create a group for each region's line and its data points
    const regionGroups = svg.selectAll(".region-line")
        .data(processedData)
        .enter().append("g")
        .attr("class", "region-line");

    // Add lines to each region group
    regionGroups.append("path")
        .attr("class", "line")
        .attr("d", d => line(d.values))
        .style("stroke", d => REGION_COLORS[d.name])
        .style("fill", "none")
        .style("stroke-width", 2.5) // Default stroke width
        .style("opacity", 0.8) // Default opacity
        .on("mouseover", function(event, d_region) {
            d3.select(this).style('stroke-width', 3.5); // Increase stroke width on hover
            showTooltip(event, d_region); // Call showTooltip, dataPoint will be found inside
        })
        .on("mousemove", function(event, d_region) {
            moveTooltip(event, d_region); // Call moveTooltip, dataPoint will be found inside
        })
        .on("mouseout", function() {
            d3.select(this).style('stroke-width', 2.5); // Restore stroke width
            hideTooltip();
        });

    // Add data points (circles) to each region group
    regionGroups.selectAll(".data-point")
        .data(d => d.values) // Bind data points (year, value) to circles
        .enter().append("circle")
        .attr("class", "data-point")
        .attr("cx", d_point => x(d_point.year))
        .attr("cy", d_point => y(d_point.value))
        .attr("r", 4) // Default radius
        .style("fill", function() {
            // Get region color from parent group's data (bound to the 'g' element)
            return REGION_COLORS[d3.select(this.parentNode).datum().name];
        })
        .style("stroke", "#fff")
        .style("stroke-width", 1.5)
        .on("mouseover", function(event, d_point) {
            d3.select(this).attr("r", 6); // Enlarge on hover
            const d_region = d3.select(this.parentNode).datum(); // Get region data from parent group
            showTooltip(event, d_region, d_point); // Pass both region and specific data point
        })
        .on("mousemove", function(event, d_point) {
            const d_region = d3.select(this.parentNode).datum(); // Get region data from parent group
            moveTooltip(event, d_region, d_point); // Pass both region and specific data point
        })
        .on("mouseout", function() {
            d3.select(this).attr("r", 4); // Restore size on mouseout
            hideTooltip();
        });

    // Add line end labels (remain unchanged, as they are part of regionGroups)
    regionGroups.append("text")
        .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
        .attr("transform", d => `translate(${x(d.value.year)},${y(d.value.value)})`)
        .attr("x", 3)
        .attr("dy", "0.35em")
        .style("font", "10px sans-serif")
        .text(d => d.name);

    // Add brush for zooming and panning (remain unchanged)
    const brush = d3.brushX()
        .extent([[0, 0], [width, height]])
        .on("end", brushed);

// ... existing code ...

// Helper functions for tooltip management (moved to the end of drawFig4 scope)
function showTooltip(event, regionData, dataPoint) {
    tooltip.transition()
        .duration(200)
        .style("opacity", .9)
        .style("display", "block"); // Ensure it's displayed

    updateTooltipContent(event, regionData, dataPoint);
}

function moveTooltip(event, regionData, dataPoint) {
    updateTooltipContent(event, regionData, dataPoint);
}

function hideTooltip() {
    tooltip.transition()
        .duration(500)
        .style("opacity", 0)
        .style("display", "none"); // Hide it completely
}

function updateTooltipContent(event, regionData, dataPoint) {
    // Use dataPoint if explicitly provided (from circle hover), otherwise find closest on line
    const displayData = dataPoint || (() => {
        const [mx, my] = d3.pointer(event);
        const year = x.invert(mx);
        const bisect = d3.bisector(d => d.year).left;
        const idx = bisect(regionData.values, year, 1);
        const d0 = regionData.values[idx - 1];
        const d1 = regionData.values[idx];
        return (d1 && year - d0.year > d1.year - year) ? d1 : d0;
    })();

    if (displayData && displayData.year && !isNaN(displayData.value)) {
        // Ensure currentGroups is a string representation for display
        const topicCombo = currentGroups.map(g => g.join(' + ')).join(', ') || 'N/A'; // Handle empty currentGroups

        tooltip.html(`
            <div class="fig4-tooltip-title">${regionData.name}</div>
            <div class="fig4-tooltip-content">
                <div class="fig4-tooltip-row">
                    <span class="fig4-tooltip-label">Year:</span>
                    <span class="fig4-tooltip-value">${d3.timeFormat("%Y")(displayData.year)}</span>
                </div>
                <div class="fig4-tooltip-row">
                    <span class="fig4-tooltip-label">Diversity:</span>
                    <span class="fig4-tooltip-value">${displayData.value.toFixed(3)}</span>
                </div>
                <div class="fig4-tooltip-row">
                    <span class="fig4-tooltip-label">Topics:</span>
                    <span class="fig4-tooltip-value">${topicCombo}</span>
                </div>
            </div>
        `)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    } else {
        hideTooltip(); // Hide if data is invalid
    }
}

</rewritten_file>