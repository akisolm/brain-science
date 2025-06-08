export function drawFig1(container) {
  const width = 1000;
  const height = 500;
  const svg = container.append("svg")
    .attr("width", width)
    .attr("height", height);

  // 全局 tooltip
  const tooltip = d3.select("#tooltip");

  // 原始标签／新标签及对应提示
  const originalLabels = {
    "Publication": "Publication",
    "Authors": "Authors",
    "MeSH Keywords": "MeSH Keywords",
    "Discipline Classification": "Discipline Classification",
    "Topic Classification": "Topic Classification",
    "Region Classification": "Region Classification",
    "Integration Type": "Integration Type"
  };

  const newLabels = {
    "Publication": "<Title (DOI)>",
    "Authors": "N_Authors=257",
    "MeSH Keywords": "<Keywords>",
    "Discipline Classification": "[0 0 1 0 1 1]",
    "Topic Classification": "[0 0 0 2 1 1 1 1 0]",
    "Region Classification": "[7 3 0 1]",
    "Integration Type": "[X X]"
  };

  const newTooltips = {
    "<Title (DOI)>": "Initial sequencing and analysis of the human genome (10.1038/35057062)",
    "N_Authors=257": "International Human Genome Sequencing Consortium",
    "<Keywords>": "Animals, Chromosome Mapping, Conserved Sequence, CpG Islands, DNA Transposable Elements, Databases, Factual...",
    "[0 0 1 0 1 1]": "SA3 ( Phenomena & Processes ) = 1\nSA5 ( Techniques & Equipment ) = 1\nSA6 ( Technology & Information Science ) = 1",
    "[0 0 0 2 1 1 1 1 0]": "CIP4 ( Biotechnology & Genetics ) = 2\nCIP5 ( Medical Specialty ) = 1\nCIP6 ( Health Sciences ) = 1\nCIP7 ( Pathology & Pharmacology ) = 1\nCIP8 ( Engineering & Informatics ) = 1",
    "[7 3 0 1]": "KR1 ( North America ) = 7\nKR2 ( Europe ) = 3\nKR3 ( Australasia ) = 0\nKR4 ( rest of the world ) = 1",
    "[X X]": "Multi-Discipline and Multi-Topic"
  };

  let toggled = false;           // 切换状态
  let animating = false;         // 动画进行中锁

  // 节点数据
  const nodes = [
    { id: "Publication", x: 140, y: 240, tooltip: "<WOS API>" },
    { id: "Authors", x: 360, y: 140, tooltip: "Scientist's Profile <Scopus API>" },
    { id: "MeSH Keywords", x: 360, y: 340, tooltip: "<PubMed API>" },
    { id: "Discipline Classification", x: 600, y: 140, tooltip: "CIP Taxonomy" },
    { id: "Topic Classification", x: 600, y: 340, tooltip: "MeSH Taxonomy" },
    { id: "Region Classification", x: 600, y: 240, tooltip: "Geo Taxonomy" },
    { id: "Integration Type", x: 860, y: 240, tooltip: "M/M X/M M/X X/X" }
  ];
  // 备份 tooltip
  nodes.forEach(d => d.tooltipBackup = d.tooltip);

  // 连线数据
  const links = [
    { source: "Publication", target: "Authors" },
    { source: "Publication", target: "MeSH Keywords" },
    { source: "Authors", target: "Discipline Classification" },
    { source: "MeSH Keywords", target: "Topic Classification" },
    { source: "Authors", target: "Region Classification" },
    { source: "Discipline Classification", target: "Integration Type" },
    { source: "Topic Classification", target: "Integration Type" },
    { source: "Region Classification", target: "Integration Type" }
  ];

  // 定义箭头 marker
  svg.append("defs").append("marker")
    .attr("id", "arrow")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 10)
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#888");

  // 创建节点组
  const nodeGroup = svg.append("g").attr("id", "nodes");

  // 绘制节点矩形
  const rects = nodeGroup.selectAll("rect")
    .data(nodes).enter().append("rect")
      .attr("x", d => d.x - 90)
      .attr("y", d => d.y - 35)
      .attr("width", 180)
      .attr("height", 70)
      .attr("fill", "#f0f0f0")
      .attr("stroke", "#333")
      .attr("rx", 6)
      .attr("ry", 6)
      .on("mouseover", (event, d) => tooltip.style("display", "block").text(d.tooltip))
      .on("mousemove", event => tooltip.style("left", (event.pageX + 10) + "px").style("top", (event.pageY + 10) + "px"))
      .on("mouseout", () => tooltip.style("display", "none"));

  // 绘制节点文字
  const texts = nodeGroup.selectAll("text")
    .data(nodes).enter().append("text")
      .attr("x", d => d.x)
      .attr("y", d => d.y + 5)
      .attr("text-anchor", "middle")
      .style("font-size", "15px");

  // 创建连线
  const linkLines = svg.selectAll("line")
    .data(links).enter().append("line")
      .attr("stroke", "#888")
      .attr("x1", d => nodes.find(n => n.id === d.source).x + 90)
      .attr("y1", d => nodes.find(n => n.id === d.source).y)
      .attr("x2", d => nodes.find(n => n.id === d.target).x - 90)
      .attr("y2", d => nodes.find(n => n.id === d.target).y);

  // 创建按钮
  const buttonGroup = svg.append("g")
    .attr("transform", "translate(40,70)")
    .style("cursor", "pointer");
  buttonGroup.append("rect")
    .attr("width", 100)
    .attr("height", 30)
    .attr("rx", 6)
    .attr("ry", 6)
    .attr("fill", "#fff")
    .attr("stroke", "#888");
  const buttonText = buttonGroup.append("text")
    .attr("x", 50)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px");
  buttonText.text("see Example");

  // 重置并播放动画
  function animateEntry() {
    animating = true; // 动画开始，锁定点击

    // 更新标签和 tooltip
    texts.text(d => toggled ? newLabels[d.id] : originalLabels[d.id]);
    nodes.forEach(d => d.tooltip = toggled ? newTooltips[newLabels[d.id]] : d.tooltipBackup);

    // 重置元素样式
    rects.attr("opacity", 0);
    texts.attr("opacity", 0);
    linkLines.each(function(d) {
      const L = this.getTotalLength();
      d3.select(this)
        .attr("stroke-dasharray", `${L} ${L}`)
        .attr("stroke-dashoffset", L)
        .attr("marker-end", null);
    });

    // 节点和文字渐入
    rects.transition().duration(800).delay((d, i) => i * 150).attr("opacity", 1);
    texts.transition().duration(800).delay((d, i) => 100 + i * 150).attr("opacity", 1);

    // 连线绘制并添加箭头
    const totalLinks = linkLines.size();
    linkLines
      .transition().duration(1000).delay((d, i) => i * 200)
      .attr("stroke-dashoffset", 0)
      .on("end", function(d, i) {
        d3.select(this).attr("marker-end", "url(#arrow)");
        // 最后一条线结束，解除锁定
        if (i === totalLinks - 1) {
          animating = false;
        }
      });
  }

  // 按钮点击
  buttonGroup.on("click", () => {
    if (animating) return; // 动画进行中时不响应点击
    toggled = !toggled;
    buttonText.text(toggled ? "see Defination" : "see Example");
    animateEntry();
  });

  // 首次播放
  animateEntry();
}