import pandas as pd
import random

#Define the data categories
categories = {
    "Movies": [
        ("Harry Potter", "positive"), ("Howls Moving Castle", "positive"), ("Ponyo", "positive"),
        ("Totoro", "positive"), ("Lord of The Rings", "positive"), ("Inception", "positive"),
        ("Clueless", "positive"), ("Spirited Away", "positive")
    ],
    "Shows": [
        ("Gilmore Girls", "positive"), ("Grace and Frankie", "positive"), ("H20", "positive"),
        ("Downton Abbey", "positive"), ("The Good Place", "positive"), ("Schitts Creek", "positive"),
        ("The Great British Baking Show", "positive"), ("Derry Girls", "positive"), ("Avatar", "positive")
    ],
    "Fav Foods": [
        ("ravioli", "positive"), ("risotto", "positive"), ("tacos", "positive"), ("yogurt", "positive"),
        ("burrata", "positive"), ("dumplings", "positive"), ("pie", "positive"), ("goat cheese", "positive")
    ],
    "Relatives": [
        ("Ben", "positive"), ("Zhuolin", "positive"), ("Shawn", "positive"), ("Heather", "positive"),
        ("Stanley", "positive"), ("Amy", "positive"), ("Alexis", "positive")
    ],
    "Famous People": [
        ("Taylor Swift", "positive"), ("Taylor Tomlinson", "positive"), ("Zendaya", "positive"),
        ("Tom Holland", "positive"), ("Lana Del Ray", "positive"), ("Selena Gomez", "positive"),
        ("Harry Styles", "positive"), ("Anne Hathaway", "positive"),
        ("Kardashians", "negative"), ("Trump", "negative"), ("Dua Lippa", "negative"), ("Bill Gates", "negative"),
        ("Jeff Bezos", "negative"), ("Kanye West", "negative"), ("Chris Rock", "negative"), ("Drake", "negative"),
        ("Putin", "negative"), ("Mark Zuckerberg", "negative"), ("Jake Paul", "negative"), ("J.K. Rowling", "negative")
    ],
    "Books/Authors": [
        ("Harry Potter", "positive"), ("Joan Didion", "positive"), ("Song of Achilles", "positive"),
        ("The Hobbit", "positive"), ("Lord of the Rings", "positive"), ("J R Tolkien", "positive"),
        ("The Magic TreeHouse", "positive"), ("The Lorax", "positive")
    ],
    "Fictional Characters": [
        ("Bilbo Baggins", "positive"), ("Hermione Potter", "positive"), ("Ron Weasley", "positive"),
        ("Emily Gilmore", "positive"), ("The Lorax", "positive"), ("Richard Gilmore", "positive"),
        ("Grace", "positive"), ("Frankie", "positive")
    ],
    "Cities": [
        ("Tijuana", "positive"), ("Paris", "positive"), ("Barcelona", "positive"), ("New York City", "positive"),
        ("Los Angeles", "positive"), ("San Francisco", "positive"), ("San Diego", "positive"), ("Chicago", "positive")
    ],
    "Music Artists/Bands": [
        ("Taylor Swift", "positive"), ("Lana Del Ray", "positive"), ("Queen", "positive"), ("Beatles", "positive"),
        ("Cat Stevens", "positive"), ("Nina Simone", "positive"), ("ABBA", "positive"), ("Carole King", "positive")
    ],
    "Stores": [
        ("Trader Joes", "positive"), ("Target", "positive"), ("TJMax", "positive"), ("Jamba Juice", "positive"),
        ("Whole Foods", "positive"), ("Michaels", "positive"), ("Petco", "positive"), ("MiuMiu", "positive")
    ],
    "Hobbies": [
        ("pickleball", "positive"), ("bike", "positive"), ("swim", "positive"), ("kayak", "positive"),
        ("reading", "positive"), ("painting", "positive"), ("origami", "positive"), ("thrifting", "positive"),
        ("football", "negative"), ("lacrosse", "negative"), ("golf", "negative"), ("sew", "negative"),
        ("fishing", "negative"), ("singing", "negative")
    ],
    "Website/Apps": [
        ("Spotify", "positive"), ("Netflix", "positive"), ("Hulu", "positive"), ("Prime", "positive"),
        ("Duolingo", "positive"), ("Pinterest", "positive"), ("Notion", "positive"), ("NYTs", "positive"),
        ("Fox", "negative"), ("Twitter", "negative"), ("Apple Music", "negative"), ("TikTok", "negative"),
        ("Apple News", "negative"), ("Snapchat", "negative"), ("Uber Eats", "negative"), ("Peacock", "negative"),
        ("Twitch", "negative"), ("ESPN", "negative"), ("Pandora", "negative"), ("Starbucks", "negative")
    ]
}


data = pd.read_csv('user_data.csv')
print("Data loaded:")
print(data.head())



grouped = data.groupby('matching_code')

# Function to generate puzzles for a given category
def generate_puzzle(category_data):
    # Filter out negative answers
    positive_answers = [answer for answer, sentiment in category_data if sentiment == "positive"]
    # Randomly select 3 answers from the positive ones
    selected_answers = random.sample(positive_answers, min(3, len(positive_answers)))
    return f"Puzzle created with answers: {', '.join(selected_answers)}"

# Initialize a list to store the puzzle results for each user pair
output_data = []

# Step 4: Process each user pair and create puzzles
for code, group in grouped:
    if len(group) == 2:  # Ensure exactly two users per pair
        user1, user2 = group.iloc[0], group.iloc[1]  # Get the two users in the pair

        # Randomly assign categories for each user
        user1_categories = random.sample(list(categories.keys()), 3)  # 3 categories for user1
        user2_categories = [cat for cat in categories.keys() if cat not in user1_categories]
 # Print out the puzzles for both users (optional for debugging)
        print(f"User1: {user1['name']} - Puzzles: {user1_puzzles}")
        print(f"User2: {user2['name']} - Puzzles: {user2_puzzles}")

        # Save the puzzles and the user information to the output list
        output_data.append({
            "matching_code": code,
            "user1_name": user1["name"],
            "user1_puzzles": ', '.join(user1_puzzles),
            "user2_name": user2["name"],
            "user2_puzzles": ', '.join(user2_puzzles)
        })

        # Step 5: After generating puzzles for all user pairs, save the results to a CSV file
output_df = pd.DataFrame(output_data)

# Save the output to a CSV file (e.g., 'generated_puzzles.csv')
output_df.to_csv('generated_puzzles.csv', index=False)

# Confirm that the data has been saved
print("Puzzle results saved to 'generated_puzzles.csv'.")


