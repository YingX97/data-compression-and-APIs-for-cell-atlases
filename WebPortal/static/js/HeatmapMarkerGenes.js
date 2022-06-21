function HeatmapMarkerGenes(result,html_element_id,selected_cell) {
        // const start = performance.now();
        // console.log("start plotting the heatmap");
        // check the button id active

        if (html_element_id === "") {
            html_element_id = "HeatmapMarkerGene";
        }

        let genes = Object.keys(result[Object.keys(result)[0]])
        let celltypes = Object.keys(result);
        
        if (!result) {
            alert("Error:Input gene name is invalid, please make sure you type in the corrent gene names")
        } else {
            // x-axis: cell types
            let x_axis = celltypes;
            // y-axis: genes
            let y_axis = genes;
            
            let ngenes = y_axis.length;
            let ncelltypes = x_axis.length;

            // let heatmap_width = 1300;
            let heatmap_height = 270 + 10 * ngenes;

            let data_content = [];
            for (var i = 0; i < ngenes; i++) {
                let each_gene_data = [];
                for (var j = 0; j < ncelltypes; j++) {
                    exp = result[celltypes[j]][genes[i]];
                    exp = Math.log10(exp + 0.5);
                    each_gene_data.push(exp);
                }
                data_content.push(each_gene_data);
            }

            var data = {
                type: 'heatmap',
                hoverongaps: false,
                colorscale: 'Reds',
            };
            var layout = {
                autosize: true, 
                title: 'Heatmap of marker genes of ' + selected_cell,
                xaxis: {
                    title: '<b>Cell types<b>',
                    automargin: true,
                    tickangle: 45
                },
                yaxis: {
                    title: '<b>Genes<b>',
                    automargin: true
                },
                // with: heatmap_width,
                height: heatmap_height,
            };
            
            data['z'] = data_content;
            data['x'] = x_axis;
            data['y'] = y_axis;
            Plotly.newPlot(document.getElementById(html_element_id), [data],layout);
        };
    } 