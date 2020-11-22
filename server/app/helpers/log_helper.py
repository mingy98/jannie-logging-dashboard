from app import *

# Place any helper functions here


def helperFunc():
    return "Helper function!"

# filter dataframe by username based on search string
def filterData(searchString: str, df: pd.DataFrame):
    searchLogs = []
    if searchString == "":
        searchLogs = df.to_dict('records')
    else:
        df1 = df[df.username.str.contains(searchString, na = False)] 
        searchLogs = df1.to_dict('records')
    return searchLogs


# process str (with | delimiter) into dataframe
def read_str_to_df(str_input: str, **kwargs) -> pd.DataFrame:

    str_input = str_input.replace("b\'", "").replace("\'", "")
    str_input = "time|status_code|filepath|send_receive|value\n" + str_input

    substitutions = [
        ('^ *', ''),  # Remove leading spaces
        (' *$', ''),  # Remove trailing spaces
        (r' *\| *', '|'),  # Remove spaces between columns
    ]
    for pattern, replacement in substitutions:
        str_input = re.sub(pattern, replacement, str_input, flags=re.MULTILINE)
    server_data_df = pd.read_csv(StringIO(str_input), sep='|', **kwargs, error_bad_lines=False)
    return server_data_df.drop(['status_code','filepath', 'send_receive'], axis=1)