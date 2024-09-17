import 'package:flutter/material.dart';
import 'package:http/http.dart' as http; 
import 'package:aplication/components/my_button.dart';
import 'package:aplication/components/my_textfield.dart';
import 'dart:convert'; 

class LoginPage extends StatelessWidget {
  LoginPage({super.key});

  final shopidController = TextEditingController();
  final usernameController = TextEditingController();
  final passwordController = TextEditingController();

  void signUserIn() async {

    final shopId = shopidController.text;
    final username = usernameController.text;
    final password = passwordController.text;

    final url = Uri.parse('https://your-api-endpoint.com/login');

    try {
      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'shopId': shopId,
          'username': username,
          'password': password,
        }),
      );

      if (response.statusCode == 200) {
        print('Request successful: ${response.statusCode}');
        print('Response: ${response.body}');
      } else {
        print('Request failed with status: ${response.statusCode}');
      }
    } catch (e) {
      print('An error occurred: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    final screenHeight = MediaQuery.of(context).size.height;
    final screenWidth = MediaQuery.of(context).size.width;

    return Scaffold(
      backgroundColor: Colors.grey[300],
      body: SafeArea(
        child: SingleChildScrollView(
          child: Center(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: screenWidth * 0.08),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Padding(
                    padding: EdgeInsets.all(screenWidth * 0.04),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.start,
                      children: [
                        Text(
                          'Company Namee',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: screenWidth * 0.05,
                          ),
                        ),
                      ],
                    ),
                  ),
                  SizedBox(height: screenHeight * 0.03),
                  Icon(
                    Icons.lock,
                    size: screenWidth * 0.2,
                  ),
                  SizedBox(height: screenHeight * 0.03),
                  Text(
                    'Bine ai revenit!',
                    style: TextStyle(
                      color: Colors.grey[700],
                      fontSize: screenWidth * 0.045,
                    ),
                  ),
                  SizedBox(height: screenHeight * 0.02),
                  MyTextField(
                    controler: shopidController,
                    hintText: 'Id Magazin',
                    obscureText: false,
                  ),
                  SizedBox(height: screenHeight * 0.015),
                  MyTextField(
                    controler: usernameController,
                    hintText: 'Utilizator',
                    obscureText: false,
                  ),
                  SizedBox(height: screenHeight * 0.015),
                  MyTextField(
                    controler: passwordController,
                    hintText: 'Parola',
                    obscureText: true,
                  ),
                  SizedBox(height: screenHeight * 0.03),
                  MyButton(
                    onTap: signUserIn, 
                  ),
                  SizedBox(height: screenHeight * 0.03),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
