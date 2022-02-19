import h5py
import numpy as np
import pandas as pd

def data_preprocessing():
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

  return df