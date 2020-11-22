from app import *
from app.helpers.log_helper import *
from app.constants.logs import *

log_bp = Blueprint("log_bp", __name__)

df = pd.DataFrame(logs)

currentVis = []

@log_bp.route("/logs", methods=["GET"])
@fractalPreProcess
def logs_get(**kwargs):
    # starting_index = max(0, int(request.args.get("start")))
    # ending_index = min(int(request.args.get("end")), len(logs))

    # if starting_index >= ending_index or starting_index >= len(logs):
    #     starting_index = 0
    #     ending_index = len(logs)

    try:
        num_skip = max(0, int(request.args.get('skip')))
        num_take = min(int(request.args.get('take')), len(logs))
        searchString = request.args.get('search')
    except TypeError:
        return jsonify({"logs": logs[0:20], "totalCount": len(logs)}), 200

    searchLogs = filterData(searchString, df)

    starting_index = int(num_skip)
    ending_index = int(num_skip+num_take)

    if starting_index >= ending_index or starting_index >= len(searchLogs):
        starting_index = 0
        ending_index = len(searchLogs)

    return jsonify({"logs": searchLogs[starting_index:ending_index], "totalCount": len(searchLogs)}), 200

@log_bp.route("/getvisual", methods=["GET"])
@fractalPreProcess
def timeseries_data_get(**kwargs):
    selectedId = 0

    encode_size = []
    encode_time = []
    latency = []
    decode_time = []
    try:
        selectedId = int(request.args.get('selected'))
    except:
        return jsonify({"encode_size":[], "encode_time": [], "latency":[], "decode_time": []}), 200 

    #print(selectedId)
    # switch to currently visible? possibly faster
    selectedLog = (df.loc[df['connection_id'] == selectedId]).to_dict('list')
    #print(selectedLog)

    client_log_addr = selectedLog.get('client_logs')[0]
    server_log_addr = selectedLog.get('server_logs')[0]

    if client_log_addr is not None:
        r = requests.get(client_log_addr).text

        # fetch data as text, process to dataframe
        r = requests.get(client_log_addr).text
        lat_df = read_str_to_df(r)
        dt_df = lat_df.copy(deep = True)

        # TODO: pass along status_code
        lat_df = lat_df.loc[lat_df.value.str.contains("Latency", na = False)]
        dt_df = dt_df.loc[dt_df.value.str.contains("Avg Decode Time", na = False)]
    
        lat_df['value'] = lat_df['value'].str.replace("Latency: ", "")
        dt_df['value'] = dt_df['value'].str.replace("Avg Decode Time: ", "")

        latency = lat_df.to_dict('records')
        decode_time = dt_df.to_dict('records')

        # print(latency)
        # print(decode_time)
        

    if server_log_addr is not None:

        # fetch data as text, process to dataframe
        r = requests.get(server_log_addr).text
        es_df = read_str_to_df(r)
        et_df = es_df.copy(deep = True)

        # TODO: pass along status_code
        es_df = es_df.loc[es_df.value.str.contains("Average Encode Size", na = False)]
        et_df = et_df.loc[et_df.value.str.contains("Average Encode Time", na = False)]
    
        es_df['value'] = es_df['value'].str.replace("Average Encode Size: ", "")
        et_df['value'] = et_df['value'].str.replace("Average Encode Time: ", "")

        encode_size = es_df.to_dict('records')
        encode_time = et_df.to_dict('records')


        # print(encode_size)
        # print(encode_time)

    return jsonify({"encode_size":encode_size, "encode_time": encode_time, "latency":latency, "decode_time": decode_time}), 200 

    #return jsonify({"encode_size":encode_size, "encode_time":encode_time, "decode_size":[], "decode_time": []}), 200
    
