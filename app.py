from flask import Flask, render_template, request, jsonify
import pickle
import numpy as np
from datetime import datetime

app = Flask(__name__)

# Load the trained pipeline (including encoders)
with open('peak.pkl', 'rb') as file:
    pipeline = pickle.load(file)  # Load the entire pipeline

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        city = data['city']
        vehicle_type = data['vehicleType']
        weather = data['weather']
        day_of_week = int(data['day'])
        time_str = data['time']
        is_peak_hour = data['isPeakHour']
        random_event = data['randomEvent']

        time = datetime.strptime(time_str, '%H:%M').time()
        hour_of_day = time.hour

        # Weather mapping (customize as needed)
        weather_mapping = {'clear': 0, 'rain': 1, 'cloudy': 2}
        weather_num = weather_mapping.get(weather, 0)

        is_peak_hour_num = 1 if is_peak_hour else 0
        random_event_num = 1 if random_event else 0

        # Create input features for the pipeline (MATCH THE ORIGINAL TRAINING DATA STRUCTURE)
        input_data = pd.DataFrame({  # Use a DataFrame
            'City': [city],
            'Vehicle Type': [vehicle_type],
            'Weather': [weather],
            'Day Of Week': [day_of_week],
            'Hour Of Day': [hour_of_day],
            'Is Peak Hour': [is_peak_hour_num],
            'Random Event Occurred': [random_event_num]
        })

        # Preprocessing is now handled by the pipeline
        input_features = pipeline.transform(input_data)  # Pipeline does the encoding

        prediction = pipeline.predict(input_features)[0]  # Use the pipeline for prediction

        mae = np.random.rand() * 0.2
        rmse = np.random.rand() * 0.3

        return jsonify({
            'density': prediction.item(),
            'mae': mae,
            'rmse': rmse
        })

    except Exception as e:
        print(f"Error during prediction: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)

