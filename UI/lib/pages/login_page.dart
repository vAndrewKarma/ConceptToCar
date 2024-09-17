import 'package:flutter/material.dart';
import 'package:aplication/components/my_button.dart';
import 'package:aplication/components/my_textfield.dart';

class LoginPage extends StatelessWidget {
  LoginPage({super.key});


  final shopidController = TextEditingController();
  final usernameController = TextEditingController();
  final passwordController = TextEditingController();

  void signUserIn() {}

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
                          'Company Name',
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
