import sqlite3

def execute_sql_from_file(db_file, sql_file):
    # Create a database connection
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()

    # Open and read the SQL file
    with open(sql_file, 'r') as file:
        sql_script = file.read()

    # Execute the SQL commands
    # Use cursor.executescript() if you have multiple SQL statements
    cursor.executescript(sql_script)

    # Commit changes and close the connection
    conn.commit()
    conn.close()

if __name__ == '__main__':
    db_filename = 'belay.sqlite3'  # Name of the SQLite database file
    sql_filename = '20240523T093000_create_tables.sql'     # SQL commands file

    execute_sql_from_file(db_filename, sql_filename)
