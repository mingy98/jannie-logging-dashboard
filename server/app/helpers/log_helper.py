from app import *

# Place any helper functions here


def helperFunc():
    return "Helper function!"


def filterData(searchString: str, df: pd.DataFrame):
    searchLogs = []
    if searchString == "":
        searchLogs = df.to_dict('records')
    else:
        df1 = df[df.username.str.contains(searchString, na = False)] 
        searchLogs = df1.to_dict('records')
    return searchLogs

def read_str_to_df(str_input: str, **kwargs) -> pd.DataFrame:

    str_input = str_input.replace("b\'", "").replace("\'", "")
    str_input = "time|status_code|filepath|send_receive|value\n" + str_input

    substitutions = [
        ('^ *', ''),  # Remove leading spaces
        (' *$', ''),  # Remove trailing spaces
        (r' *\| *', '|'),  # Remove spaces between columns
    ]
    if all(line.lstrip().startswith('|') and line.rstrip().endswith('|') for line in str_input.strip().split('\n')):
        substitutions.extend([
            (r'^\|', ''),  # Remove redundant leading delimiter
            (r'\|$', ''),  # Remove redundant trailing delimiter
        ])
    for pattern, replacement in substitutions:
        str_input = re.sub(pattern, replacement, str_input, flags=re.MULTILINE)
    server_data_df = pd.read_csv(StringIO(str_input), sep='|', **kwargs)
    return server_data_df.drop(['status_code','filepath', 'send_receive'], axis=1)