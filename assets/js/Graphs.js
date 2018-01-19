(function (d3, angular) {

  class Base {
    constructor(config) {
      Object.assign(this, config);
      this.svg = d3.select(this.selector).html('').append('svg');
      this.width = this.width - this.margin.left - this.margin.right;
      this.height = this.height - this.margin.top - this.margin.bottom;

      this.svg
        .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

      this.init(config);
    }
    get data() {
      return this._data;
    }
    set data(data) {
      this._data = data;
    }
  }

  class Bubble extends Base {
    init(config) {
      Object.assign(this, config);
    }
    render(data) {
      this.data = data;
      const selection = d3.select(this.selector).data(this.data);
      this.div = selection;
      this.svg = this.div.selectAll('svg');

      this.tooltip = selection
          .append('div')
          .attr('class', 'chart-tooltip')
          .text('');

      this.simulation = d3.forceSimulation(this.data)
          .force('charge', d3.forceManyBody().strength([-10]))
          .force('x', d3.forceX())
          .force('y', d3.forceY())
          .on('tick', this.ticked.bind(this));

      const colorCircles = d3.scaleOrdinal(d3.schemeCategory20);
      const scaleRadius = d3.scaleLinear()
            .domain([d3.min(this.data, d => d.total), d3.max(data, d => +d.total)])
            .range([5, 18]);

      this.node = this.svg.selectAll('circle')
          .data(this.data)
          .enter()
          .append('circle')
          .style('stroke', 'gray')
          .attr('r', d => scaleRadius(d.total))
          .style('fill', d => colorCircles(d[this.xData]))
          .attr('transform', `translate(${[this.width/2, this.height/2]})`)
          .on('mouseover', d => {
              this.tooltip.html(`From: ${d[this.xData]}<br>To: ${d.targets[0].ip}
                <br>Transfered: ${bytesToSize(d.total)}
                <br>Connections: ${d.count}`);
              return this.tooltip.style('visibility', 'visible');
          })
          .on('mousemove', () => {
              return this.tooltip
                .style('top', `${(d3.event.pageY - 200)}px`)
                .style('left', `${(d3.event.pageX - 30)}px`);
          })
          .on('mouseout', () => { this.tooltip.style('visibility', 'hidden') });
      }
      ticked(e) {
        this.node.attr('cx', d => d.x)
            .attr('cy', d => d.y);
      }
      xData(value) {
        if (!value) {
          return this.xData;
        }
        this.xData = value;
        return this;
      }
      yData(value) {
        if (!value) {
          return this.yData;
        }
        this.columnForRadius = value;
        return chart;
      }
  }

  class Line extends Base {
    init(config) {
      Object.assign(this, config);
    }
    render(data) {
      const dataGroup = d3.nest()
                          .key(d => d.group)
                          .entries(data);

      const parseTime = d3.timeParse("%d-%b-%y");
      const color = d3.scaleOrdinal(d3.schemeCategory20);

      const lSpace = this.width/dataGroup.length;

      this.svg.attr("width", this.width + this.margin.left + this.margin.right)
         .attr("height", this.height + this.margin.top + this.margin.bottom)
         .append("g")
         .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

      const xScale = d3.scaleTime()
                       .range([this.margin.right + this.margin.left, this.width - this.margin.right])
                       .domain([d3.min(data, d => d.xProp), d3.max(data, d => d.xProp)]);
      const yScale = d3.scaleLinear()
                       .range([this.height - this.margin.top, 0])
                       .domain([0, d3.max(data, d => d.yProp)]);

      const xAxis = d3.axisBottom(xScale)
                       // .tickFormat(parseTime);
      const yAxis = d3.axisLeft(yScale)
                      .tickFormat(bytesToSize);

      this.svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(0,${(this.height - this.margin.bottom)})`)
        .call(xAxis);

      this.svg.append('g')
        .attr('class', 'y axis')
        .attr('transform', `translate(${this.margin.left},0)`)
        .call(yAxis);

      const self = this;
      dataGroup.forEach((d,i) => {
        const lineGen = d3.line()
                          .x(d => xScale(d.xProp))
                          .y(d => yScale(d.yProp));
        this.svg.append('path')
        .attr('d', lineGen(d.values))
        .attr("class", "line")
        .attr('stroke', (d,j) => `hsl(${Math.random() * 360}, 100%, 50%)`)
        .attr('stroke-width', 2)
        .attr('id', `line_${dot2num(d.key)}`)
        .attr('fill', 'none')
        .on('mouseover', evt => {
          self.svg.select(`#label_${dot2num(d.key)}`)
          .style('font-size', '12px')
        })
        .on('mouseout', () => {
          self.svg.select(`#label_${dot2num(d.key)}`)
          .style('font-size', '12px')
        });


        this.svg.append('text')
        .attr('x', (lSpace/2)+i*lSpace +10)
        .attr('y', this.height)
        .style('fill', 'black')
        .attr('class','legend')
        .attr('id', `label_${dot2num(d.key)}`)
        .text(d.key)
        .style('cursor', 'pointer')
        .on('mouseover', evt => {
          self.svg.select(`#line_${dot2num(d.key)}`)
          .style('stroke-width', '6px')
        })
        .on('mouseout', () => {
          self.svg.select(`#line_${dot2num(d.key)}`)
          .style('stroke-width', '2px')
        });
      });
    }
  }

  class VerticalBar extends Base {
    init(data) {
      this.chartSize().drawAxis().drawChart();
      this.xScale
        .paddingInner(0.1)
        .paddingOuter(0.5);
    }
    chartSize() {
      this.xScale
        .domain(this.data.map(d => d[this.xData]))
        .range([0, this.width])

      this.yScale
        .domain([0, d3.max(this.data, d => +d[this.yData])])
        .range([this.height, 0]);
      return this;
    }
    drawAxis() {
      const yAxis = d3.axisLeft(this.yScale).tickSizeInner(-this.width)

      this.axisLayer.append('g')
        .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)
        .attr('class', 'axis y')
        .call(yAxis);

      const xAxis = d3.axisBottom(this.xScale)

      this.axisLayer.append('g')
        .attr('class', 'axis x')
        .attr('transform', `translate(${this.margin.left}, ${this.height + (this.margin.bottom + this.margin.top)})`)
        .call(xAxis);
      return this;
    }
    drawChart() {
      const t = d3.transition()
        .duration(800)
        .ease(d3.easeLinear);

      const bar = this.chartLayer.selectAll('.bar').data(this.data)
      bar.exit().remove();
      bar.enter().append('rect').classed('bar', true)
        .merge(bar)
        .attr('fill', 'blue')
        .attr('width', this.xScale.bandwidth())
        .attr('height', 0)
        .attr('transform', d => `translate(${this.xScale(d[this.xData])}, ${this.height})`)

      this.chartLayer.selectAll('.bar').transition(t)
        .attr('height', d => this.height - this.yScale(+d[this.yData]))
        .attr('transform', d => `translate(${this.xScale(d[this.xData])}, ${this.yScale(+d[this.yData])})`);
      return this;
    }
  }

  class HorizontalLine extends Base {
    init(data) {
      this.data = data;
      this.axisLayer = this.svg.append('g').classed('axisLayer', true);
      this.chartLayer = this.svg.append('g').classed('chartLayer', true);
      const parseTime = d3.timeParse('%Y%m%d');

      this.xScale = d3.scaleTime().range([0, this.width]),
      this.yScale = d3.scaleLinear().range([this.height, 0]),
      this.zScale = d3.scaleOrdinal(d3.schemeCategory10);

      const line = d3.line()
            .curve(d3.curveBasis)
            .x(d => x(d[this.xData]))
            .y(d => y(d[this.yData]));

      this.chartSize().drawAxis().drawChart();
    }
    get data() {
      return this._data;
    }
    set data(data) {
      this._data = data;
    }
    chartSize() {
      return this;
    }
    drawAxis() {
      return this;
    }
    drawChart() {
      return this;
    }
  }

  class Graphs {
    constructor() {
      Object.assign(this, {
        VerticalBar,
        HorizontalLine,
        Bubble,
        Line
      });
      return this;
    }
   }

  angular.module('InsightEngine').service('Graphs', Graphs);

  function bytesToSize(bytes) {
     const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
     if (bytes == 0) return '0 Byte';
     const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
     return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
  };
  function dot2num(dot) {
    const d = dot.split('.');
    return ((((((+d[0])*256)+(+d[1]))*256)+(+d[2]))*256)+(+d[3]);
  }

}(window.d3, window.angular));