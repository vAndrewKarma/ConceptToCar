import 'package:aplication/components/my_button.dart';
import 'package:aplication/components/my_textfield.dart';
import 'package:flutter/material.dart';


class LoginPage extends StatelessWidget {
  LoginPage({super.key});

  // text editing controllers
  final shopidController = TextEditingController();
  final usernameController = TextEditingController();
  final passwordController = TextEditingController();

  // sign user in method
  void signUserIn() {}

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[300],
      body: SafeArea(
          child: Center(
            child: Column(
                children: [

               //text_logo
              Padding(
                padding: const EdgeInsets.all(25.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.start,
                  children: [
                    Container(
                      child: Text(
                        'Company Name',
                        style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 25,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
                  const SizedBox(height: 50),

               // Icon
                const Icon(
                  Icons.lock,
                  size: 100,
                ),
                  const SizedBox(height: 50),

              //welcome back
              Text(
                  'Bine ai revenit!',
                  style: TextStyle(
                      color: Colors.grey[700],
                    fontSize: 20,
                  ),
              ),
                  const SizedBox(height: 25),

              //shop_id
                  MyTextField(
                      controler: shopidController,
                      hintText: 'Id Magazin',
                      obscureText: false,
                  ),
                  const SizedBox(height: 10),

              //usename textfield
                  MyTextField(
                    controler: usernameController,
                    hintText: 'Utilizator',
                    obscureText: false,
                  ),

                  const SizedBox(height: 10),

              //password
                  MyTextField(
                    controler: passwordController,
                    hintText: 'Parola',
                    obscureText: true,
                  ),

                  const SizedBox(height: 25),

              //sign in
                  MyButton(
                    onTap: signUserIn,
                  ),

                  ],
              ),
            )
        )
      );
  }
}