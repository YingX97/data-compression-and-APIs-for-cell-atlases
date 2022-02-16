from base64 import decode
from flask import Flask, send_from_directory,request
from flask_restful import Resource, Api
from flask_cors import CORS
import pandas as pd
import h5py
import numpy as np
import json

app = Flask(__name__, static_url_path='/static')
api = Api(app)
# Note: this might be unsafe
CORS(app)

# this is an endpoint (gives access to the file)
@app.route('/js/<path:path>')
def send_js(path):
    return send_from_directory('static/js', path)

@app.route('/css/<path:path>')
def send_css(path):
    return send_from_directory('static/css', path)

@app.route('/',methods=['GET'])
def helloworld():
    with open('index.html') as f:
        response = f.read()
    return response

# use Carsten's h5 data
class H5GeneExpression(Resource):
    def get(self):
        h5_data = h5py.File('./static/scData/condensed_lung_atlas.h5',"r")
        df = pd.DataFrame(data=np.array(h5_data['cell_type']\
            ['gene_expression_average']['block0_values']),\
            index=np.array(h5_data['cell_type']['gene_expression_average']['axis1'])\
            ,columns=np.array(h5_data['cell_type']['gene_expression_average']['axis0'])).T
        
        # current index in the dataframe is writtern as binary string.
        # We need to convert it into normal string
        new_index=[]
        for i in df.index:
            new_index.append(i.decode('utf-8'))
        # Similarly for columns name
        new_columns=[]
        for i in df.columns:
            new_columns.append(i.decode('utf-8'))

        df.index = new_index
        df.columns = new_columns

        # # Select 5 genes of interest:
        # plot_df = df.filter(items = ['Car4','Vwf', 'Col1a1', 'Ptprc', 'Ms4a1'], axis=0)
        # plot_data = plot_df.to_json()
        
        # get the name of genes input by the web user
        gene_names = request.args.get('gene_names')
        if gene_names is None:
            plot_data = df.to_json()
        else:
            a_gene_names = gene_names.split(",")
            plot_df = df.filter(items = a_gene_names,axis=0)
            plot_data = plot_df.to_json()

        return json.loads(plot_data)

# this is an API endpoint (return data)
api.add_resource(H5GeneExpression, '/data')

if __name__ == '__main__':
    app.run(debug=True)