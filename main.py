import csv
from collections import defaultdict

with open('user_data.csv', 'r') as csvfile:
    csv_reader = csv.reader('user_data.csv')

# define user class to store user data
class User:
    def __init__(self, user_id, code, categories):
        self.user_id = user_id
        self.code = code
        self.categories = categories
        self.puzzles = []
        self.ground_truth = None  # Placeholder for ground truth answers

#load user data from CSV
def load_users(file_path):
    users = {}
    pairs = defaultdict(list)

    with open(file_path, mode='r') as file:
        reader = csv.reader(file)
        next(csv_reader) #skips first line- i know i want first line on csv to outline what each column is
        category_columns = [col for col in headers if col not in ['user_id', 'code']]

        for row in reader:
            user_id = row[headers.index('user_id')]
            code = row[headers.index('code')]
            categories = {
                col: row[headers.index(col)].split(';')
                for col in category_columns
            }
            user = User(user_id, code, categories)
            users[user_id] = user
            pairs[code].append(user)
    return users, pairs

#choose the first user's answers in each pair as ground truth
def assign_ground_truth(pairs):
    for code, user_pair in pairs.items():
        if len(user_pair) == 2:
            ground_truth = user_pair[0].categories  # Use the first user's answers as ground truth
            for user in user_pair:
                user.ground_truth = ground_truth

#main setup
file_path = "user_data.csv"
users, pairs = load_users(file_path)
assign_ground_truth(pairs)

#puzzle generation function
def generate_puzzle(puzzle_type, category_data, config):
    positives = category_data['positives']
    negatives = category_data['negatives'][:config['negatives']]
    phantom = category_data['phantom'][:config['phantom']] if config['phantom'] else []
    hints = category_data['hints'] if config['hints'] else []

    puzzle = {
        "positives": positives,
        "negatives": negatives,
        "phantom": phantom,
        "hints": hints
    }
    return puzzle

#puzzle functions/configs
PUZZLE_CONFIGS = {
    'A': {"hints": False, "preset": True, "phantom": False, "negatives": 50},
    'B': {"hints": True, "preset": True, "phantom": False, "negatives": 50},
    'C': {"hints": False, "preset": False, "phantom": False, "negatives": 50},
    'D': {"hints": False, "preset": True, "phantom": True, "negatives": 50},
    'E': {"hints": False, "preset": True, "phantom": False, "negatives": 25},
    'F': {"hints": False, "preset": True, "phantom": False, "negatives": 75},
}

#assign puzzles to each user
def generate_user_puzzles(users, pairs):
    for code, user_pair in pairs.items():
        if len(user_pair) == 2:
            # Deterministically assign categories based on their order
            categories = list(user_pair[0].ground_truth.keys())

            for idx, user in enumerate(user_pair):
                for puzzle_type, config in PUZZLE_CONFIGS.items():
                    for version in range(3):  # Generate 3 versions per type
                        category_index = (idx + version) % len(categories)  # Cycle through categories
                        category = categories[category_index]
                        category_data = {
                            'positives': user.ground_truth[category],
                            'negatives': [],
                            'phantom': [],
                            'hints': []
                        }
                        puzzle = generate_puzzle(puzzle_type, category_data, config)
                        user.puzzles.append(puzzle)

generate_user_puzzles(users, pairs)


